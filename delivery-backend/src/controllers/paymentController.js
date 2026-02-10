const paymentService = require('../services/paymentService');
const { USER_TYPES } = require('../utils/constants');

/**
 * Initiate Telebirr payment
 * POST /api/v1/payments/telebirr/initiate
 * Body: { order_id, customer_phone }
 */
exports.initiateTelebirrPayment = async (req, res, next) => {
    try {
        const { order_id, customer_phone } = req.body;

        if (!order_id || !customer_phone) {
            return res.status(400).json({
                success: false,
                message: 'order_id and customer_phone are required'
            });
        }

        // Verify customer owns the order
        if (req.userType === USER_TYPES.CUSTOMER) {
            const { Order } = require('../models');
            const order = await Order.findByPk(order_id);
            if (!order || order.customer_id !== req.user.customer_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to initiate payment for this order'
                });
            }
        }

        const result = await paymentService.initiateTelebirrPayment(order_id, customer_phone);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handle Telebirr payment callback/webhook
 * POST /api/v1/payments/telebirr/callback
 * Body: { transaction_id, status, amount, ... }
 */
exports.handleTelebirrCallback = async (req, res, next) => {
    try {
        const { transaction_id, status, amount, ...webhookData } = req.body;

        if (!transaction_id || !status) {
            return res.status(400).json({
                success: false,
                message: 'transaction_id and status are required'
            });
        }

        // TODO: Verify webhook signature from Telebirr for security
        // const isValidSignature = verifyTelebirrWebhookSignature(req);
        // if (!isValidSignature) {
        //     return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
        // }

        const result = await paymentService.handleTelebirrCallback(
            transaction_id,
            status,
            amount,
            webhookData
        );

        return res.status(200).json({
            success: result.success,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Check Telebirr payment status
 * GET /api/v1/payments/telebirr/status/:transactionId
 */
exports.checkTelebirrPaymentStatus = async (req, res, next) => {
    try {
        const { transactionId } = req.params;

        if (!transactionId) {
            return res.status(400).json({
                success: false,
                message: 'transactionId is required'
            });
        }

        const result = await paymentService.checkTelebirrPaymentStatus(transactionId);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Confirm cash payment (driver confirms cash received)
 * POST /api/v1/payments/cash/confirm/:orderId
 */
exports.confirmCashPayment = async (req, res, next) => {
    try {
        const orderId = parseInt(req.params.orderId, 10);

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'orderId is required'
            });
        }

        // Only drivers can confirm cash payment
        if (req.userType !== USER_TYPES.DRIVER) {
            return res.status(403).json({
                success: false,
                message: 'Only drivers can confirm cash payment'
            });
        }

        const driverId = req.user.driver_id;
        const result = await paymentService.confirmCashPayment(orderId, driverId);

        return res.status(200).json({
            success: true,
            data: result,
            message: 'Cash payment confirmed successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get payment details for an order
 * GET /api/v1/payments/:orderId
 */
exports.getPaymentDetails = async (req, res, next) => {
    try {
        const orderId = parseInt(req.params.orderId, 10);

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'orderId is required'
            });
        }

        // Verify user has access to this order
        const { Order } = require('../models');
        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (req.userType === USER_TYPES.CUSTOMER && order.customer_id !== req.user.customer_id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this payment'
            });
        }

        if (req.userType === USER_TYPES.DRIVER && order.driver_id !== req.user.driver_id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this payment'
            });
        }

        if (req.userType === USER_TYPES.RESTAURANT && order.restaurant_id !== req.user.restaurant_id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this payment'
            });
        }

        const result = await paymentService.getPaymentDetails(orderId);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};
