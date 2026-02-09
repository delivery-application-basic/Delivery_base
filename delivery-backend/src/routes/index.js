const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const customerRoutes = require('./customerRoutes');
const restaurantRoutes = require('./restaurantRoutes');
const driverRoutes = require('./driverRoutes');
const menuRoutes = require('./menuRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const deliveryRoutes = require('./deliveryRoutes');

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/drivers', driverRoutes);
router.use('/menu', menuRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/deliveries', deliveryRoutes);

module.exports = router;
