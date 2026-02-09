const express = require('express');
const router = express.Router();
const {
    registerCustomer,
    registerRestaurant,
    registerDriver,
    login,
    refreshToken,
    logout,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validators/authValidator');

router.post('/register/customer', ...validateRegistration('customer'), registerCustomer);
router.post('/register/restaurant', ...validateRegistration('restaurant'), registerRestaurant);
router.post('/register/driver', ...validateRegistration('driver'), registerDriver);
router.post('/login', ...validateLogin, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
