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
const receiptRoutes = require('./receiptRoutes');
const walletRoutes = require('./walletRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/drivers', driverRoutes);
router.use('/menu', menuRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/orders', receiptRoutes); // Receipt routes also use /orders prefix
router.use('/deliveries', deliveryRoutes);
router.use('/drivers', walletRoutes); // Wallet routes use /drivers prefix
router.use('/admin', adminRoutes);

module.exports = router;
