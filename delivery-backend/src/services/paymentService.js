const { Order, Payment, Customer } = require('../models');
const { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } = require('../utils/constants');
const { processPartneredOrderPayment } = require('./paymentFlowService');
const { emitTrackingUpdate, getTrackingStage } = require('./orderTrackingService');
const { getIO } = require('../config/socket');

// Telebirr API Configuration
const TELEBIRR_API_KEY = process.env.TELEBIRR_API_KEY || '';
const TELEBIRR_API_SECRET = process.env.TELEBIRR_API_SECRET || '';
const TELEBIRR_MERCHANT_ID = process.env.TELEBIRR_MERCHANT_ID || '';
const TELEBIRR_CALLBACK_URL = process.env.TELEBIRR_CALLBACK_URL || 'http://localhost:3000/api/v1/payments/telebirr/callback';
const TELEBIRR_SANDBOX_MODE = process.env.TELEBIRR_SANDBOX_MODE === 'true';

/**
 * Generate unique transaction ID for Telebirr
 * @returns {string} Transaction ID
 */
function generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `TX${timestamp}${random}`;
}

/**
 * Initiate Telebirr payment
 * @param {number} orderId - Order ID
 * @param {string} customerPhone - Customer phone number (Telebirr account)
 * @returns {Promise<Object>} Payment initiation details
 */
async function initiateTelebirrPayment(orderId, customerPhone) {
    const order = await Order.findByPk(orderId, {
        include: [
            { model: Customer, as: 'customer', attributes: ['customer_id', 'full_name', 'phone_number', 'email'] }
        ]
    });

    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }

    if (order.payment_method !== PAYMENT_METHODS.TELEBIRR) {
        const err = new Error('Order payment method is not Telebirr');
        err.statusCode = 400;
        throw err;
    }

    if (order.payment_status === PAYMENT_STATUS.PAID || order.payment_status === PAYMENT_STATUS.COMPLETED) {
        const err = new Error('Order already paid');
        err.statusCode = 400;
        throw err;
    }

    // Generate transaction ID
    const transactionId = generateTransactionId();

    // Store transaction ID in order
    await order.update({
        telebirr_transaction_id: transactionId
    });

    // TODO: Integrate with actual Telebirr API
    // For now, return mock payment URL
    // In production, this would make an API call to Telebirr to initiate payment
    
    const telebirrApiUrl = TELEBIRR_SANDBOX_MODE 
        ? 'https://api-sandbox.telebirr.com/payment/initiate'
        : 'https://api.telebirr.com/payment/initiate';

    // Mock payment URL (replace with actual Telebirr API integration)
    const paymentUrl = `telebirr://pay?transaction_id=${transactionId}&amount=${order.total_amount}&merchant_id=${TELEBIRR_MERCHANT_ID}&callback_url=${encodeURIComponent(TELEBIRR_CALLBACK_URL)}`;

    // Create pending payment record
    const payment = await Payment.create({
        order_id: orderId,
        amount: order.total_amount,
        driver_tip: order.driver_tip || 0,
        payment_method: PAYMENT_METHODS.TELEBIRR,
        payment_status: PAYMENT_STATUS.PENDING,
        transaction_id: transactionId,
        payment_type: 'customer_to_platform',
        recipient_type: 'platform'
    });

    return {
        payment_id: payment.payment_id,
        transaction_id: transactionId,
        order_id: orderId,
        amount: parseFloat(order.total_amount),
        payment_url: paymentUrl,
        expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
        status: 'pending'
    };
}

/**
 * Handle Telebirr payment callback/webhook
 * @param {string} transactionId - Telebirr transaction ID
 * @param {string} status - Payment status ('success', 'failed', 'pending')
 * @param {number} amount - Paid amount (for verification)
 * @param {Object} webhookData - Additional webhook data
 * @returns {Promise<Object>} Payment confirmation details
 */
async function handleTelebirrCallback(transactionId, status, amount, webhookData = {}) {
    // Find order by transaction ID
    const order = await Order.findOne({
        where: { telebirr_transaction_id: transactionId }
    });

    if (!order) {
        const err = new Error('Order not found for transaction');
        err.statusCode = 404;
        throw err;
    }

    // Find payment record
    const payment = await Payment.findOne({
        where: { transaction_id: transactionId }
    });

    if (!payment) {
        const err = new Error('Payment record not found');
        err.statusCode = 404;
        throw err;
    }

    // Verify amount matches
    if (Math.abs(parseFloat(amount) - parseFloat(order.total_amount)) > 0.01) {
        console.error(`Amount mismatch: Expected ${order.total_amount}, Received ${amount}`);
        const err = new Error('Payment amount mismatch');
        err.statusCode = 400;
        throw err;
    }

    // Update payment status based on callback status
    if (status === 'success' || status === 'completed') {
        await payment.update({
            payment_status: PAYMENT_STATUS.COMPLETED,
            payment_date: new Date()
        });

        // Update order payment status
        await order.update({
            payment_status: PAYMENT_STATUS.PAID
        });

        // Process payment for partnered restaurants
        if (order.order_flow_type === 'partnered') {
            try {
                await processPartneredOrderPayment(order.order_id);
            } catch (error) {
                console.error(`Failed to process partnered payment for order ${order.order_id}:`, error.message);
            }
        }

        // Emit tracking update (Stage 2: Payment Verified)
        try {
            await order.reload();
            const trackingStage = getTrackingStage(order);
            emitTrackingUpdate(order.order_id, trackingStage, order);
        } catch (error) {
            console.error(`Failed to emit tracking update:`, error.message);
        }

        // Notify customer via Socket.io
        const io = getIO();
        if (io) {
            io.to(`order:${order.order_id}`).emit('payment:completed', {
                order_id: order.order_id,
                transaction_id: transactionId,
                amount: parseFloat(amount),
                payment_method: 'telebirr',
                timestamp: new Date()
            });
        }

        return {
            success: true,
            order_id: order.order_id,
            transaction_id: transactionId,
            payment_status: 'completed',
            message: 'Payment completed successfully'
        };
    } else if (status === 'failed') {
        await payment.update({
            payment_status: PAYMENT_STATUS.FAILED
        });

        await order.update({
            payment_status: PAYMENT_STATUS.FAILED
        });

        return {
            success: false,
            order_id: order.order_id,
            transaction_id: transactionId,
            payment_status: 'failed',
            message: 'Payment failed'
        };
    } else {
        // Still pending
        return {
            success: false,
            order_id: order.order_id,
            transaction_id: transactionId,
            payment_status: 'pending',
            message: 'Payment still pending'
        };
    }
}

/**
 * Check Telebirr payment status
 * @param {string} transactionId - Telebirr transaction ID
 * @returns {Promise<Object>} Payment status
 */
async function checkTelebirrPaymentStatus(transactionId) {
    const order = await Order.findOne({
        where: { telebirr_transaction_id: transactionId }
    });

    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }

    const payment = await Payment.findOne({
        where: { transaction_id: transactionId }
    });

    if (!payment) {
        const err = new Error('Payment not found');
        err.statusCode = 404;
        throw err;
    }

    // TODO: In production, make API call to Telebirr to check actual status
    // For now, return database status

    return {
        transaction_id: transactionId,
        order_id: order.order_id,
        amount: parseFloat(order.total_amount),
        payment_status: payment.payment_status,
        payment_method: payment.payment_method,
        payment_date: payment.payment_date,
        order_status: order.order_status
    };
}

/**
 * Confirm cash payment (driver confirms cash received)
 * @param {number} orderId - Order ID
 * @param {number} driverId - Driver ID (for authorization)
 * @returns {Promise<Object>} Payment confirmation details
 */
async function confirmCashPayment(orderId, driverId) {
    const order = await Order.findByPk(orderId);

    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }

    if (order.payment_method !== PAYMENT_METHODS.CASH) {
        const err = new Error('Order payment method is not cash');
        err.statusCode = 400;
        throw err;
    }

    if (order.driver_id !== driverId) {
        const err = new Error('Driver not assigned to this order');
        err.statusCode = 403;
        throw err;
    }

    if (order.order_status !== ORDER_STATUS.DELIVERED) {
        const err = new Error('Order must be delivered before confirming cash payment');
        err.statusCode = 400;
        throw err;
    }

    if (order.payment_status === PAYMENT_STATUS.PAID || order.payment_status === PAYMENT_STATUS.COMPLETED) {
        const err = new Error('Payment already confirmed');
        err.statusCode = 400;
        throw err;
    }

    // Create payment record
    const payment = await Payment.create({
        order_id: orderId,
        amount: order.total_amount,
        driver_tip: order.driver_tip || 0,
        payment_method: PAYMENT_METHODS.CASH,
        payment_status: PAYMENT_STATUS.COMPLETED,
        payment_type: 'customer_to_platform',
        recipient_type: 'platform',
        payment_date: new Date()
    });

    // Update order payment status
    await order.update({
        payment_status: PAYMENT_STATUS.PAID
    });

    // Process payment for partnered restaurants
    if (order.order_flow_type === 'partnered') {
        try {
            await processPartneredOrderPayment(order.order_id);
        } catch (error) {
            console.error(`Failed to process partnered payment for order ${order.order_id}:`, error.message);
        }
    }

    return {
        success: true,
        payment_id: payment.payment_id,
        order_id: orderId,
        amount: parseFloat(order.total_amount),
        payment_method: 'cash',
        payment_status: 'completed',
        confirmed_at: payment.payment_date
    };
}

/**
 * Get payment details for an order
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Payment details
 */
async function getPaymentDetails(orderId) {
    const order = await Order.findByPk(orderId, {
        attributes: ['order_id', 'payment_method', 'payment_status', 'total_amount', 'driver_tip', 'telebirr_transaction_id']
    });

    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }

    const payment = await Payment.findOne({
        where: { order_id: orderId },
        order: [['payment_id', 'DESC']] // Get latest payment
    });

    return {
        order_id: orderId,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        total_amount: parseFloat(order.total_amount),
        driver_tip: parseFloat(order.driver_tip || 0),
        transaction_id: payment?.transaction_id || order.telebirr_transaction_id,
        payment_date: payment?.payment_date,
        payment_id: payment?.payment_id
    };
}

module.exports = {
    initiateTelebirrPayment,
    handleTelebirrCallback,
    checkTelebirrPaymentStatus,
    confirmCashPayment,
    getPaymentDetails
};
