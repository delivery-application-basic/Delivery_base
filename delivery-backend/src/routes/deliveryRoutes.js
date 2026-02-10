const express = require('express');
const router = express.Router();
const {
    getDeliveryDetails,
    updateLocation,
    updateStatus,
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

module.exports = router;
