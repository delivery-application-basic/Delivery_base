const { body, param } = require('express-validator');
const { validationResult } = require('express-validator');
const { ORDER_STATUS, PAYMENT_METHODS } = require('../../utils/constants');

const validationHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

const validOrderStatuses = Object.values(ORDER_STATUS);
const validPaymentMethods = Object.values(PAYMENT_METHODS);

const validateCreateOrder = [
    body('address_id').isInt({ min: 1 }).withMessage('Valid address_id is required'),
    body('payment_method')
        .isIn(validPaymentMethods)
        .withMessage(`payment_method must be one of: ${validPaymentMethods.join(', ')}`),
    body('special_instructions').optional().trim().isLength({ max: 500 }).withMessage('Special instructions too long'),
    validationHandler
];

const validateOrderId = [
    param('id').isInt({ min: 1 }).withMessage('Valid order id is required'),
    validationHandler
];

const validateUpdateStatus = [
    param('id').isInt({ min: 1 }).withMessage('Valid order id is required'),
    body('order_status')
        .isIn(validOrderStatuses)
        .withMessage(`order_status must be one of: ${validOrderStatuses.join(', ')}`),
    validationHandler
];

const validateCancelOrder = [
    param('id').isInt({ min: 1 }).withMessage('Valid order id is required'),
    body('cancellation_reason').optional().trim().isLength({ max: 500 }).withMessage('Cancellation reason too long'),
    validationHandler
];

const validateRestaurantId = [
    param('restaurantId').isInt({ min: 1 }).withMessage('Valid restaurant id is required'),
    validationHandler
];

const validateDriverId = [
    param('driverId').isInt({ min: 1 }).withMessage('Valid driver id is required'),
    validationHandler
];

exports.validateOrder = validateCreateOrder;
exports.validateCreateOrder = validateCreateOrder;
exports.validateOrderId = validateOrderId;
exports.validateUpdateStatus = validateUpdateStatus;
exports.validateCancelOrder = validateCancelOrder;
exports.validateRestaurantId = validateRestaurantId;
exports.validateDriverId = validateDriverId;
