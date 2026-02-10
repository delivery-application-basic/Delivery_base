const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');

const validationHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

const validateAutoAssign = [
    body('order_id')
        .isInt({ min: 1 })
        .withMessage('Valid order_id is required'),
    validationHandler
];

const validateManualAssign = [
    body('order_id')
        .isInt({ min: 1 })
        .withMessage('Valid order_id is required'),
    body('driver_id')
        .isInt({ min: 1 })
        .withMessage('Valid driver_id is required'),
    validationHandler
];

const validateOrderId = [
    param('orderId')
        .isInt({ min: 1 })
        .withMessage('Valid order ID is required'),
    validationHandler
];

const validateGetAvailableDrivers = [
    query('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    query('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    query('radius')
        .optional()
        .isFloat({ min: 0.1, max: 100 })
        .withMessage('Radius must be between 0.1 and 100 km'),
    validationHandler
];

const validateAssignmentStatus = [
    query('status')
        .optional()
        .isIn(['offered', 'accepted', 'rejected', 'expired'])
        .withMessage('Status must be one of: offered, accepted, rejected, expired'),
    validationHandler
];

module.exports = {
    validateAutoAssign,
    validateManualAssign,
    validateOrderId,
    validateGetAvailableDrivers,
    validateAssignmentStatus
};
