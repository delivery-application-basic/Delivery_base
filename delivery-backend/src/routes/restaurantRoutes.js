const express = require('express');
const router = express.Router();
const {
    getRestaurants,
    getRestaurant,
    getMyProfile,
    updateProfile,
    updateHours,
    updateStatus,
    searchRestaurants
} = require('../controllers/restaurantController');
const { getMenuByRestaurant } = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');
const { USER_TYPES } = require('../utils/constants');

const { upload } = require('../middleware/upload');

router.get('/', getRestaurants);
router.get('/search', searchRestaurants);
// Owner route must be before /:id so "me" is not used as id
router.get('/me/profile', protect, authorize(USER_TYPES.RESTAURANT), getMyProfile);
router.get('/:id', getRestaurant);
router.get('/:id/menu', getMenuByRestaurant);

// Restaurant Owner only routes
router.use(protect);
router.use(authorize(USER_TYPES.RESTAURANT));

router.put('/:id', updateProfile);
router.post('/:id/logo', upload.single('logo'), require('../controllers/restaurantController').uploadLogo);
router.patch('/:id/status', updateStatus);
router.put('/:id/hours', updateHours);

module.exports = router;
