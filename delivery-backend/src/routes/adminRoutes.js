const express = require('express');
const router = express.Router();
const {
    approveRestaurant,
    rejectRestaurant,
    getPendingRestaurants
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { USER_TYPES } = require('../utils/constants');

// All admin routes require authentication and admin role
// For now, we'll allow any authenticated user to access these for testing
// In production, you should have a proper admin role
router.use(protect);

// Restaurant verification routes
router.get('/restaurants/pending', getPendingRestaurants);
router.patch('/restaurants/:id/approve', approveRestaurant);
router.patch('/restaurants/:id/reject', rejectRestaurant);

module.exports = router;
