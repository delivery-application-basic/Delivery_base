const express = require('express');
const router = express.Router();
const {
    registerCustomer,
    registerRestaurant,
    registerDriver,
    login
} = require('../controllers/authController');

router.post('/register/customer', registerCustomer);
router.post('/register/restaurant', registerRestaurant);
router.post('/register/driver', registerDriver);
router.post('/login', login);

module.exports = router;
