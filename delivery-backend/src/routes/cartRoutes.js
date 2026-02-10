const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const cartController = require('../controllers/cartController');
const { validateAddCartItem, validateUpdateCartItem, validateCartItemId } = require('../middleware/validators/cartValidator');

router.use(protect);
router.use(authorize('customer'));

router.get('/', cartController.getCart);
router.post('/items', validateAddCartItem, cartController.addItem);
router.put('/items/:id', validateUpdateCartItem, cartController.updateItem);
router.delete('/items/:id', validateCartItemId, cartController.removeItem);
router.delete('/', cartController.clearCart);

module.exports = router;
