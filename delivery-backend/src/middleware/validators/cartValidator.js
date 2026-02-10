const { body, param } = require('express-validator');
const { validationResult } = require('express-validator');

const validationHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

const validateAddCartItem = [
    body('item_id').isInt({ min: 1 }).withMessage('Valid item_id is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validationHandler
];

const validateUpdateCartItem = [
    param('id').isInt({ min: 1 }).withMessage('Valid cart item id is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validationHandler
];

const validateCartItemId = [
    param('id').isInt({ min: 1 }).withMessage('Valid cart item id is required'),
    validationHandler
];

exports.validateAddCartItem = validateAddCartItem;
exports.validateUpdateCartItem = validateUpdateCartItem;
exports.validateCartItemId = validateCartItemId;
