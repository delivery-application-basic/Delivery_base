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
    resetPassword,
    changePassword,
    switchRole,
    getMyBranches,
    switchBranch
} = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validators/authValidator');
const { protect } = require('../middleware/auth');

router.post('/register/customer', ...validateRegistration('customer'), registerCustomer);
router.post('/register/restaurant', ...validateRegistration('restaurant'), registerRestaurant);
router.post('/register/driver', ...validateRegistration('driver'), registerDriver);
router.post('/login', ...validateLogin, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', protect, changePassword);
router.post('/switch-role', protect, switchRole);
router.get('/my-branches', protect, getMyBranches);
router.post('/switch-branch', protect, switchBranch);

module.exports = router;
