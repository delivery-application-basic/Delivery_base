const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const orderController = require('../controllers/orderController');
const {
    validateCreateOrder,
    validateOrderId,
    validateUpdateStatus,
    validateCancelOrder,
    validateRestaurantId,
    validateDriverId
} = require('../middleware/validators/orderValidator');

router.use(protect);

router.post('/', authorize('customer'), validateCreateOrder, orderController.createOrder);
router.get('/', orderController.getMyOrders);
router.get('/restaurant/:restaurantId', validateRestaurantId, orderController.getRestaurantOrders);
router.get('/driver/:driverId', validateDriverId, orderController.getDriverOrders);
router.get('/:id', validateOrderId, orderController.getOrderById);
router.patch('/:id/status', validateUpdateStatus, orderController.updateOrderStatus);
router.post('/:id/cancel', validateCancelOrder, orderController.cancelOrder);

module.exports = router;
