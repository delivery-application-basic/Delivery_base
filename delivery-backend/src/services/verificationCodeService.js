const { Order, Delivery, Customer, Driver } = require('../models');
const { ORDER_STATUS } = require('../utils/constants');
const { getIO } = require('../config/socket');

// Configuration
const VERIFICATION_CODE_LENGTH = parseInt(process.env.VERIFICATION_CODE_LENGTH) || 6;
const VERIFICATION_CODE_EXPIRY_HOURS = parseInt(process.env.VERIFICATION_CODE_EXPIRY_HOURS) || 24;
const VERIFICATION_CODE_MAX_ATTEMPTS = parseInt(process.env.VERIFICATION_CODE_MAX_ATTEMPTS) || 3;

/**
 * Generate a random 6-digit verification code
 * @returns {string} 6-digit code
 */
function generateVerificationCode() {
    const min = 100000; // 6-digit minimum
    const max = 999999; // 6-digit maximum
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
}

/**
 * Generate and store verification code for an order
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Verification code details
 */
async function generateOrderVerificationCode(orderId) {
    const order = await Order.findByPk(orderId, {
        include: [
            { model: Customer, as: 'customer', attributes: ['customer_id', 'full_name', 'phone_number', 'email'] },
            { model: Driver, as: 'driver', attributes: ['driver_id', 'full_name', 'phone_number'] }
        ]
    });

    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }

    // Check if code already exists and is not expired
    if (order.delivery_verification_code && order.verification_code_expires_at) {
        const now = new Date();
        const expiresAt = new Date(order.verification_code_expires_at);
        if (expiresAt > now) {
            // Code is still valid
            return {
                code: order.delivery_verification_code,
                expires_at: order.verification_code_expires_at,
                order_id: orderId
            };
        }
    }

    // Generate new code
    const code = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + VERIFICATION_CODE_EXPIRY_HOURS);

    // Store code in order
    await order.update({
        delivery_verification_code: code,
        verification_code_expires_at: expiresAt,
        verification_code_attempts: 0
    });

    return {
        code,
        expires_at: expiresAt,
        order_id: orderId
    };
}

/**
 * Send verification code to customer and driver
 * @param {number} orderId - Order ID
 * @returns {Promise<void>}
 */
async function sendVerificationCode(orderId) {
    const order = await Order.findByPk(orderId, {
        include: [
            { model: Customer, as: 'customer', attributes: ['customer_id', 'full_name', 'phone_number', 'email'] },
            { model: Driver, as: 'driver', attributes: ['driver_id', 'full_name', 'phone_number'] }
        ]
    });

    if (!order) {
        throw new Error('Order not found');
    }

    if (!order.delivery_verification_code) {
        // Generate code if not exists
        await generateOrderVerificationCode(orderId);
        // Reload order to get the code
        await order.reload();
    }

    const code = order.delivery_verification_code;
    const expiresAt = order.verification_code_expires_at;

    // Send to customer via SMS/Push notification
    if (order.customer) {
        const customerMessage = `Your order #${orderId} verification code is: ${code}. Show this code to the driver when your order arrives. Code expires at ${new Date(expiresAt).toLocaleString()}.`;
        
        // TODO: Integrate with SMS service (Twilio/Ethiopian SMS Gateway)
        console.log(`SMS to Customer ${order.customer.phone_number}: ${customerMessage}`);
        
        // Send via Socket.io push notification
        const io = getIO();
        if (io) {
            io.to(`customer:${order.customer_id}`).emit('verification-code', {
                order_id: orderId,
                code: code,
                expires_at: expiresAt,
                message: 'Your verification code has been sent'
            });
        }
    }

    // Send to driver when assigned
    if (order.driver) {
        const driverMessage = `Order #${orderId} assigned. Verification code: ${code}. Enter this code when customer shows it to confirm delivery.`;
        
        // TODO: Integrate with SMS service
        console.log(`SMS to Driver ${order.driver.phone_number}: ${driverMessage}`);
        
        // Send via Socket.io push notification
        const io = getIO();
        if (io) {
            io.to(`driver:${order.driver_id}`).emit('verification-code', {
                order_id: orderId,
                code: code,
                expires_at: expiresAt,
                message: 'Verification code for assigned order'
            });
        }
    }

    return {
        customer_notified: !!order.customer,
        driver_notified: !!order.driver,
        code: code,
        expires_at: expiresAt
    };
}

/**
 * Verify delivery code entered by driver
 * @param {number} orderId - Order ID
 * @param {string} code - Verification code
 * @param {number} driverId - Driver ID (for authorization)
 * @returns {Promise<Object>} Verification result
 */
async function verifyDeliveryCode(orderId, code, driverId) {
    const order = await Order.findByPk(orderId, {
        include: [
            { model: Delivery, as: 'delivery', attributes: ['delivery_id', 'driver_id', 'verification_code_used', 'verification_attempts'] }
        ]
    });

    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }

    // Verify driver is assigned to this order
    if (order.driver_id !== driverId) {
        const err = new Error('Driver not assigned to this order');
        err.statusCode = 403;
        throw err;
    }

    // Check if already verified
    if (order.verification_code_verified_at) {
        return {
            verified: true,
            message: 'Code already verified',
            verified_at: order.verification_code_verified_at
        };
    }

    // Check if code exists
    if (!order.delivery_verification_code) {
        const err = new Error('Verification code not generated for this order');
        err.statusCode = 400;
        throw err;
    }

    // Check expiry
    if (order.verification_code_expires_at) {
        const now = new Date();
        const expiresAt = new Date(order.verification_code_expires_at);
        if (expiresAt < now) {
            const err = new Error('Verification code has expired. Please request a new code.');
            err.statusCode = 400;
            throw err;
        }
    }

    // Check attempt limit
    const attempts = order.verification_code_attempts || 0;
    if (attempts >= VERIFICATION_CODE_MAX_ATTEMPTS) {
        const err = new Error(`Maximum verification attempts (${VERIFICATION_CODE_MAX_ATTEMPTS}) exceeded. Please request a new code.`);
        err.statusCode = 400;
        throw err;
    }

    // Verify code
    const isValid = order.delivery_verification_code === code;

    if (!isValid) {
        // Increment attempt counter
        await order.update({
            verification_code_attempts: attempts + 1
        });

        // Also update delivery attempts if delivery exists
        if (order.delivery) {
            await order.delivery.update({
                verification_attempts: (order.delivery.verification_attempts || 0) + 1
            });
        }

        const remainingAttempts = VERIFICATION_CODE_MAX_ATTEMPTS - (attempts + 1);
        const err = new Error(`Invalid verification code. ${remainingAttempts} attempt(s) remaining.`);
        err.statusCode = 400;
        throw err;
    }

    // Code is valid - mark as verified
    const verifiedAt = new Date();
    await order.update({
        verification_code_verified_at: verifiedAt,
        verification_code_attempts: 0 // Reset attempts on success
    });

    // Update delivery record
    if (order.delivery) {
        await order.delivery.update({
            verification_code_used: true,
            verification_attempts: 0
        });
    }

    // Update order status to delivered
    if (order.order_status !== ORDER_STATUS.DELIVERED) {
        await order.update({
            order_status: ORDER_STATUS.DELIVERED,
            delivered_at: verifiedAt
        });
    }

    // Update payment status if cash payment
    if (order.payment_method === 'cash' && order.payment_status === 'pending') {
        await order.update({
            payment_status: 'paid'
        });
    }

    return {
        verified: true,
        message: 'Delivery verified successfully',
        verified_at: verifiedAt,
        order_id: orderId
    };
}

/**
 * Regenerate verification code for an order (if expired)
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} New verification code details
 */
async function regenerateVerificationCode(orderId) {
    const order = await Order.findByPk(orderId);

    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }

    // Check if order is already delivered
    if (order.order_status === ORDER_STATUS.DELIVERED) {
        const err = new Error('Cannot regenerate code for delivered order');
        err.statusCode = 400;
        throw err;
    }

    // Generate new code
    const result = await generateOrderVerificationCode(orderId);
    
    // Send new code to customer and driver
    await sendVerificationCode(orderId);

    return result;
}

/**
 * Get verification code for an order (for customer/driver viewing)
 * @param {number} orderId - Order ID
 * @param {number} userId - User ID (customer or driver)
 * @param {string} userType - User type ('customer' or 'driver')
 * @returns {Promise<Object>} Verification code details
 */
async function getVerificationCode(orderId, userId, userType) {
    const order = await Order.findByPk(orderId, {
        attributes: ['order_id', 'delivery_verification_code', 'verification_code_expires_at', 'verification_code_attempts', 'verification_code_verified_at', 'customer_id', 'driver_id']
    });

    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }

    // Authorization check
    if (userType === 'customer' && order.customer_id !== userId) {
        const err = new Error('Not authorized to view this code');
        err.statusCode = 403;
        throw err;
    }

    if (userType === 'driver' && order.driver_id !== userId) {
        const err = new Error('Not authorized to view this code');
        err.statusCode = 403;
        throw err;
    }

    if (!order.delivery_verification_code) {
        // Generate code if not exists
        await generateOrderVerificationCode(orderId);
        await order.reload();
    }

    return {
        order_id: orderId,
        code: order.delivery_verification_code,
        expires_at: order.verification_code_expires_at,
        verified: !!order.verification_code_verified_at,
        verified_at: order.verification_code_verified_at,
        attempts_remaining: VERIFICATION_CODE_MAX_ATTEMPTS - (order.verification_code_attempts || 0)
    };
}

module.exports = {
    generateOrderVerificationCode,
    sendVerificationCode,
    verifyDeliveryCode,
    regenerateVerificationCode,
    getVerificationCode,
    generateVerificationCode
};
