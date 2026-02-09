const express = require('express');
const router = express.Router();
const {
    getRestaurants,
    getRestaurant,
    updateProfile,
    updateHours,
    searchRestaurants
} = require('../controllers/restaurantController');
const { getMenuByRestaurant } = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');
const { USER_TYPES } = require('../utils/constants');

router.get('/', getRestaurants);
router.get('/search', searchRestaurants);
router.get('/:id', getRestaurant);
router.get('/:id/menu', getMenuByRestaurant);

// Restaurant Owner only routes
router.use(protect);
router.use(authorize(USER_TYPES.RESTAURANT));

router.put('/:id', updateProfile);
router.put('/:id/hours', updateHours);

module.exports = router;
