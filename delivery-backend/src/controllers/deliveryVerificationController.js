const verificationCodeService = require('../services/verificationCodeService');
const { USER_TYPES } = require('../utils/constants');

/**
 * Verify delivery code (driver enters code shown by customer)
 * POST /api/v1/deliveries/:orderId/verify
 * Body: { verification_code }
 */
exports.verifyDeliveryCode = async (req, res, next) => {
    try {
        const orderId = parseInt(req.params.orderId, 10);
        const { verification_code } = req.body;

        if (!verification_code) {
            return res.status(400).json({
                success: false,
                message: 'verification_code is required'
            });
        }

        // Only drivers can verify codes
        if (req.userType !== USER_TYPES.DRIVER) {
            return res.status(403).json({
                success: false,
                message: 'Only drivers can verify delivery codes'
            });
        }

        const driverId = req.user.driver_id;
        const result = await verificationCodeService.verifyDeliveryCode(orderId, verification_code, driverId);

        return res.status(200).json({
            success: true,
            data: result,
            message: 'Delivery verified successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get verification code for an order (for customer/driver viewing)
 * GET /api/v1/deliveries/:orderId/verification-code
 */
exports.getVerificationCode = async (req, res, next) => {
    try {
        const orderId = parseInt(req.params.orderId, 10);

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'orderId is required'
            });
        }

        // Only customers and drivers can view codes
        if (req.userType !== USER_TYPES.CUSTOMER && req.userType !== USER_TYPES.DRIVER) {
            return res.status(403).json({
                success: false,
                message: 'Only customers and drivers can view verification codes'
            });
        }

        const userId = req.userType === USER_TYPES.CUSTOMER ? req.user.customer_id : req.user.driver_id;
        const userType = req.userType === USER_TYPES.CUSTOMER ? 'customer' : 'driver';

        const result = await verificationCodeService.getVerificationCode(orderId, userId, userType);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Regenerate verification code (if expired)
 * POST /api/v1/deliveries/:orderId/regenerate-code
 */
exports.regenerateVerificationCode = async (req, res, next) => {
    try {
        const orderId = parseInt(req.params.orderId, 10);

        // Only customers and drivers can regenerate codes
        if (req.userType !== USER_TYPES.CUSTOMER && req.userType !== USER_TYPES.DRIVER) {
            return res.status(403).json({
                success: false,
                message: 'Only customers and drivers can regenerate verification codes'
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
                message: 'Not authorized to regenerate code for this order'
            });
        }

        if (req.userType === USER_TYPES.DRIVER && order.driver_id !== req.user.driver_id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to regenerate code for this order'
            });
        }

        const result = await verificationCodeService.regenerateVerificationCode(orderId);

        return res.status(200).json({
            success: true,
            data: result,
            message: 'Verification code regenerated and sent successfully'
        });
    } catch (error) {
        next(error);
    }
};
