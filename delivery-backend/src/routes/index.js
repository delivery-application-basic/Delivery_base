const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const customerRoutes = require('./customerRoutes');
const restaurantRoutes = require('./restaurantRoutes');
const driverRoutes = require('./driverRoutes');
const menuRoutes = require('./menuRoutes');
// Add other routes as they are implemented

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/drivers', driverRoutes);
router.use('/menu', menuRoutes);

module.exports = router;
