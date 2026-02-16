const { body } = require('express-validator');
const { validationResult } = require('express-validator');
const { USER_TYPES } = require('../../utils/constants');

const validationHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorArray = errors.array();
        console.error('Validation Errors:', errorArray);
        return res.status(400).json({
            success: false,
            message: errorArray[0].msg, // Return the first error message
            errors: errorArray
        });
    }
    next();
};

const baseRegisterRules = [
    body('phone_number').trim().notEmpty().withMessage('Phone number is required'),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const customerRegisterRules = [
    ...baseRegisterRules,
    body('full_name').trim().notEmpty().withMessage('Full name is required').isLength({ max: 100 }).withMessage('Full name must be at most 100 characters'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email format'),
];

const restaurantRegisterRules = [
    ...baseRegisterRules,
    body('restaurant_name').trim().notEmpty().withMessage('Restaurant name is required').isLength({ max: 150 }).withMessage('Restaurant name must be at most 150 characters'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email format'),
    body('street_address').trim().notEmpty().withMessage('Street address is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('latitude')
        .optional({ checkFalsy: true })
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90 (e.g. 8.7525 for Bishoftu)')
        .toFloat(),
    body('longitude')
        .optional({ checkFalsy: true })
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180 (e.g. 38.9785 for Bishoftu)')
        .toFloat(),
];

const driverRegisterRules = [
    ...baseRegisterRules,
    body('full_name').trim().notEmpty().withMessage('Full name is required').isLength({ max: 100 }).withMessage('Full name must be at most 100 characters'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email format'),
    body('driver_license_number').trim().notEmpty().withMessage('Driver license number is required'),
    body('id_card_number').trim().notEmpty().withMessage('ID card number is required'),
    body('vehicle_type').trim().notEmpty().withMessage('Vehicle type is required'),
];

const loginRules = [
    body('phone_number').trim().notEmpty().withMessage('Phone number is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('user_type').isIn([USER_TYPES.CUSTOMER, USER_TYPES.RESTAURANT, USER_TYPES.DRIVER]).withMessage('Valid user_type is required (customer, restaurant, driver)'),
];

const validateRegistration = (userType) => {
    const rules = {
        customer: customerRegisterRules,
        restaurant: restaurantRegisterRules,
        driver: driverRegisterRules,
    };
    const selectedRules = rules[userType] || baseRegisterRules;
    return [...selectedRules, validationHandler];
};

const validateLogin = [...loginRules, validationHandler];

module.exports = { validateRegistration, validateLogin };
