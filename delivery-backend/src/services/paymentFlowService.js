const { Order, Payment, Restaurant, DriverWallet, PaymentSettlement } = require('../models');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../utils/constants');

/**
 * Determine order flow type based on restaurant partnership status
 * @param {number} restaurantId - Restaurant ID
 * @returns {Promise<string>} 'partnered' or 'non_partnered'
 */
async function determineOrderFlowType(restaurantId) {
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
        throw new Error('Restaurant not found');
    }

    // Partnered: is_verified = true AND verification_status = 'approved'
    if (restaurant.is_verified && restaurant.verification_status === 'approved') {
        return 'partnered';
    }
    return 'non_partnered';
}

/**
 * Process payment for partnered restaurant flow
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Payment details
 */
async function processPartneredOrderPayment(orderId) {
    const order = await Order.findByPk(orderId);
    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }

    if (order.order_flow_type !== 'partnered') {
        const err = new Error('Order is not a partnered restaurant order');
        err.statusCode = 400;
        throw err;
    }

    // Create customer payment record
    const payment = await Payment.create({
        order_id: orderId,
        amount: order.total_amount,
        driver_tip: order.driver_tip || 0,
        payment_method: order.payment_method,
        payment_status: PAYMENT_STATUS.COMPLETED,
        payment_type: 'customer_to_platform',
        recipient_type: 'platform',
        payment_date: new Date()
    });

    // Update order payment status
    await order.update({
        payment_status: 'paid'
    });

    return {
        payment_id: payment.payment_id,
        order_id: orderId,
        amount: payment.amount,
        payment_type: 'customer_to_platform',
        message: 'Payment processed. Will be settled with restaurant after order completion.'
    };
}

/**
 * Process payment for non-partnered restaurant flow
 * Customer pays estimated amount → goes to driver's virtual wallet
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Payment details
 */
async function processNonPartneredOrderPayment(orderId) {
    const order = await Order.findByPk(orderId);
    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }

    if (order.order_flow_type !== 'non_partnered') {
        const err = new Error('Order is not a non-partnered restaurant order');
        err.statusCode = 400;
        throw err;
    }

    // Ensure driver is assigned
    if (!order.driver_id) {
        const err = new Error('Driver must be assigned before processing non-partnered payment');
        err.statusCode = 400;
        throw err;
    }

    // Get or create driver wallet
    let wallet = await DriverWallet.findOne({ where: { driver_id: order.driver_id } });
    if (!wallet) {
        wallet = await DriverWallet.create({
            driver_id: order.driver_id,
            balance: 0,
            pending_balance: 0,
            total_deposited: 0,
            total_withdrawn: 0
        });
    }

    // Estimated total amount (customer pays this)
    const estimatedTotal = order.estimated_total_amount || order.total_amount;

    // Create customer payment record
    const payment = await Payment.create({
        order_id: orderId,
        amount: estimatedTotal,
        driver_tip: order.driver_tip || 0,
        payment_method: order.payment_method,
        payment_status: PAYMENT_STATUS.COMPLETED,
        payment_type: 'customer_to_platform',
        recipient_type: 'driver',
        recipient_id: order.driver_id,
        payment_date: new Date()
    });

    // Deposit to driver's pending balance (will be moved to balance after receipt approval)
    await wallet.deposit(estimatedTotal, true); // true = pending balance

    // Update order
    await order.update({
        payment_status: 'paid',
        estimated_total_amount: estimatedTotal
    });

    return {
        payment_id: payment.payment_id,
        order_id: orderId,
        amount: estimatedTotal,
        payment_type: 'customer_to_platform',
        driver_wallet_balance: wallet.getPendingBalance(),
        message: 'Payment processed. Amount added to driver virtual wallet (pending). Driver will pay restaurant and upload receipt.'
    };
}

/**
 * Settle payment with restaurant (partnered flow)
 * Called after order is delivered
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Settlement details
 */
async function settlePartneredOrder(orderId) {
    const order = await Order.findByPk(orderId, {
        include: [{ model: Restaurant, as: 'restaurant' }]
    });

    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }

    if (order.order_flow_type !== 'partnered') {
        const err = new Error('Order is not a partnered restaurant order');
        err.statusCode = 400;
        throw err;
    }

    if (order.order_status !== ORDER_STATUS.DELIVERED) {
        const err = new Error('Order must be delivered before settlement');
        err.statusCode = 400;
        throw err;
    }

    const restaurant = order.restaurant;
    const commissionRate = parseFloat(restaurant.commission_rate) || 15.0;
    const grossAmount = parseFloat(order.subtotal);
    const commissionAmount = (grossAmount * commissionRate) / 100;
    const netAmount = grossAmount - commissionAmount;

    // Create payment to restaurant
    await Payment.create({
        order_id: orderId,
        amount: netAmount,
        payment_method: 'bank_transfer', // Or restaurant's preferred method
        payment_status: PAYMENT_STATUS.PENDING,
        payment_type: 'platform_to_restaurant',
        recipient_type: 'restaurant',
        recipient_id: restaurant.restaurant_id,
        payment_date: new Date()
    });

    // Create payment settlement record
    const settlement = await PaymentSettlement.create({
        recipient_type: 'restaurant',
        recipient_id: restaurant.restaurant_id,
        settlement_period_start: new Date(order.order_date),
        settlement_period_end: new Date(order.delivered_at),
        total_orders: 1,
        gross_amount: grossAmount,
        commission_amount: commissionAmount,
        net_amount: netAmount,
        payment_method: 'bank_transfer',
        payment_status: 'pending'
    });

    return {
        settlement_id: settlement.settlement_id,
        restaurant_id: restaurant.restaurant_id,
        gross_amount: grossAmount,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        net_amount: netAmount,
        message: 'Settlement created. Will be processed in next settlement cycle.'
    };
}

/**
 * Reimburse driver after receipt approval (non-partnered flow)
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Reimbursement details
 */
async function reimburseDriver(orderId) {
    const order = await Order.findByPk(orderId);
    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }

    if (order.order_flow_type !== 'non_partnered') {
        const err = new Error('Order is not a non-partnered restaurant order');
        err.statusCode = 400;
        throw err;
    }

    if (order.reimbursement_status !== 'approved') {
        const err = new Error('Receipt must be approved before reimbursement');
        err.statusCode = 400;
        throw err;
    }

    if (!order.driver_id) {
        const err = new Error('Driver not assigned to order');
        err.statusCode = 400;
        throw err;
    }

    const wallet = await DriverWallet.findOne({ where: { driver_id: order.driver_id } });
    if (!wallet) {
        const err = new Error('Driver wallet not found');
        err.statusCode = 404;
        throw err;
    }

    const estimatedTotal = parseFloat(order.estimated_total_amount || order.total_amount);
    const actualTotal = parseFloat(order.actual_total_amount);
    const deliveryFee = parseFloat(order.delivery_fee || 0);
    const driverTip = parseFloat(order.driver_tip || 0);

    // Calculate reimbursement
    // Reimbursement = (estimated - actual) + delivery_fee + tip
    // If actual > estimated, driver keeps the difference (already paid)
    const difference = estimatedTotal - actualTotal;
    const reimbursementAmount = Math.max(0, difference) + deliveryFee + driverTip;

    // Move from pending to balance
    await wallet.movePendingToBalance(estimatedTotal);
    
    // If actual amount is less than estimated, driver gets the difference
    // If actual amount is more, driver already paid extra (no additional reimbursement)
    if (difference > 0) {
        // Driver gets refund of difference + delivery fee + tip
        await wallet.deposit(reimbursementAmount, false);
    } else {
        // Driver only gets delivery fee + tip (already paid extra for food)
        await wallet.deposit(deliveryFee + driverTip, false);
    }

    // Create payment record
    await Payment.create({
        order_id: orderId,
        amount: reimbursementAmount,
        driver_tip: driverTip,
        payment_method: 'bank_transfer',
        payment_status: PAYMENT_STATUS.COMPLETED,
        payment_type: 'platform_to_driver',
        recipient_type: 'driver',
        recipient_id: order.driver_id,
        payment_date: new Date()
    });

    // Update order
    await order.update({
        reimbursement_status: 'completed'
    });

    return {
        order_id: orderId,
        estimated_total: estimatedTotal,
        actual_total: actualTotal,
        difference: difference,
        delivery_fee: deliveryFee,
        driver_tip: driverTip,
        reimbursement_amount: reimbursementAmount,
        driver_wallet_balance: wallet.getAvailableBalance(),
        message: 'Driver reimbursed successfully'
    };
}

module.exports = {
    determineOrderFlowType,
    processPartneredOrderPayment,
    processNonPartneredOrderPayment,
    settlePartneredOrder,
    reimburseDriver
};
