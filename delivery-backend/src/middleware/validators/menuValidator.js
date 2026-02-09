const { body } = require('express-validator');
const { validationResult } = require('express-validator');

const validationHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

const validateAddMenuItem = [
    body('item_name').trim().notEmpty().withMessage('Item name is required').isLength({ max: 150 }).withMessage('Item name must be at most 150 characters'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').optional().isLength({ max: 100 }).withMessage('Category must be at most 100 characters'),
    body('description').optional().isString(),
    body('preparation_time').optional().isInt({ min: 0 }).withMessage('Preparation time must be a non-negative integer'),
    body('is_vegetarian').optional().isBoolean(),
    body('is_spicy').optional().isBoolean(),
    body('is_available').optional().isBoolean(),
    validationHandler
];

const validateUpdateMenuItem = [
    body('item_name').optional().trim().notEmpty().withMessage('Item name cannot be empty').isLength({ max: 150 }).withMessage('Item name must be at most 150 characters'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').optional().isLength({ max: 100 }).withMessage('Category must be at most 100 characters'),
    body('description').optional().isString(),
    body('preparation_time').optional().isInt({ min: 0 }).withMessage('Preparation time must be a non-negative integer'),
    body('is_vegetarian').optional().isBoolean(),
    body('is_spicy').optional().isBoolean(),
    body('is_available').optional().isBoolean(),
    validationHandler
];

exports.validateAddMenuItem = validateAddMenuItem;
exports.validateUpdateMenuItem = validateUpdateMenuItem;
