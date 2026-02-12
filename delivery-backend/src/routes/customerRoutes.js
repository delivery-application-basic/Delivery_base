const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { protect } = require('../middleware/auth');

// Address routes
router.get('/addresses', protect, customerController.getAddresses);
router.post('/addresses', protect, customerController.addAddress);
router.put('/addresses/:id', protect, customerController.updateAddress);
router.delete('/addresses/:id', protect, customerController.deleteAddress);
router.patch('/addresses/:id/default', protect, customerController.setDefaultAddress);

module.exports = router;
