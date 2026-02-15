const express = require('express');
const router = express.Router();
const {
    getDeliveryDetails,
    updateLocation,
    updateStatus,
    updateStatusByOrderId,
    uploadProof,
    getRoute
} = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/auth');
const { USER_TYPES } = require('../utils/constants');
const { param, body } = require('express-validator');
const { validationResult } = require('express-validator');

const validationHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

const validateOrderId = [
    param('orderId').isInt({ min: 1 }).withMessage('Valid order ID is required'),
    validationHandler
];

const validateDeliveryId = [
    param('id').isInt({ min: 1 }).withMessage('Valid delivery ID is required'),
    validationHandler
];

const validateLocation = [
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required (-90 to 90)'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required (-180 to 180)'),
    validationHandler
];

const validateStatus = [
    body('status').isIn(['assigned', 'heading_to_restaurant', 'at_restaurant', 'picked_up', 'in_transit', 'delivered', 'failed'])
        .withMessage('Valid delivery status is required'),
    validationHandler
];

const validateProof = [
    body('proof_url').notEmpty().withMessage('proof_url is required'),
    validationHandler
];

/**
 * Update delivery status by order ID (driver app convenience)
 * PATCH /api/v1/deliveries/order/:orderId/status
 * Access: Driver only
 */
router.patch(
    '/order/:orderId/status',
    protect,
    authorize(USER_TYPES.DRIVER),
    validateOrderId,
    validateStatus,
    updateStatusByOrderId
);

/**
 * Get delivery details by order ID
 * GET /api/v1/deliveries/:orderId
 * Access: Customer, Restaurant, Driver, Admin
 */
router.get(
    '/:orderId',
    protect,
    validateOrderId,
    getDeliveryDetails
);

/**
 * Get delivery route (for map display)
 * GET /api/v1/deliveries/:orderId/route
 * Access: Customer, Restaurant, Driver, Admin
 */
router.get(
    '/:orderId/route',
    protect,
    validateOrderId,
    getRoute
);

/**
 * Update driver location
 * PATCH /api/v1/deliveries/:id/location
 * Access: Driver only
 */
router.patch(
    '/:id/location',
    protect,
    authorize(USER_TYPES.DRIVER),
    validateDeliveryId,
    validateLocation,
    updateLocation
);

/**
 * Update delivery status
 * PATCH /api/v1/deliveries/:id/status
 * Access: Driver only
 */
router.patch(
    '/:id/status',
    protect,
    authorize(USER_TYPES.DRIVER),
    validateDeliveryId,
    validateStatus,
    updateStatus
);

/**
 * Upload delivery proof
 * POST /api/v1/deliveries/:id/proof
 * Access: Driver only
 */
router.post(
    '/:id/proof',
    protect,
    authorize(USER_TYPES.DRIVER),
    validateDeliveryId,
    validateProof,
    uploadProof
);

/**
 * Verify delivery code (driver enters code shown by customer)
 * POST /api/v1/deliveries/:orderId/verify
 * Body: { verification_code }
 * Access: Driver only
 */
const deliveryVerificationController = require('../controllers/deliveryVerificationController');
const validateVerificationCode = [
    body('verification_code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Valid 6-digit verification code is required'),
    validationHandler
];

router.post(
    '/:orderId/verify',
    protect,
    authorize(USER_TYPES.DRIVER),
    validateOrderId,
    validateVerificationCode,
    deliveryVerificationController.verifyDeliveryCode
);

/**
 * Get verification code for an order
 * GET /api/v1/deliveries/:orderId/verification-code
 * Access: Customer, Driver (for their own orders)
 */
router.get(
    '/:orderId/verification-code',
    protect,
    validateOrderId,
    deliveryVerificationController.getVerificationCode
);

/**
 * Regenerate verification code (if expired)
 * POST /api/v1/deliveries/:orderId/regenerate-code
 * Access: Customer, Driver (for their own orders)
 */
router.post(
    '/:orderId/regenerate-code',
    protect,
    validateOrderId,
    deliveryVerificationController.regenerateVerificationCode
);

module.exports = router;
