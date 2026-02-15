const express = require('express');
const router = express.Router();
const {
    getMenuByRestaurant,
    getItemDetails,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    uploadMenuItemPicture
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');
const { USER_TYPES } = require('../utils/constants');
const { validateAddMenuItem, validateUpdateMenuItem } = require('../middleware/validators/menuValidator');
const upload = require('../middleware/upload');

// Public routes
router.get('/restaurant/:restaurantId', getMenuByRestaurant);
router.get('/items/:id', getItemDetails);

// Restaurant Owner only routes
router.use(protect);
router.use(authorize(USER_TYPES.RESTAURANT));

router.post('/items', validateAddMenuItem, addMenuItem);
router.put('/items/:id', validateUpdateMenuItem, updateMenuItem);
router.delete('/items/:id', deleteMenuItem);
router.patch('/items/:id/availability', toggleAvailability);
router.post('/items/:id/picture', upload.single('picture'), uploadMenuItemPicture);

module.exports = router;
