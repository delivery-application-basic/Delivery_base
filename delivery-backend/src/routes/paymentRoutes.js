const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { validationResult } = require('express-validator');

const validationHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

const validateOrderId = [
    body('order_id').isInt({ min: 1 }).withMessage('Valid order_id is required'),
    validationHandler
];

const validateTransactionId = [
    param('transactionId').notEmpty().withMessage('transactionId is required'),
    validationHandler
];

const validateTelebirrInitiate = [
    body('order_id').isInt({ min: 1 }).withMessage('Valid order_id is required'),
    body('customer_phone').notEmpty().withMessage('customer_phone is required'),
    validationHandler
];

/**
 * Initiate Telebirr payment
 * POST /api/v1/payments/telebirr/initiate
 * Body: { order_id, customer_phone }
 * Access: Customer (for their own orders)
 */
router.post(
    '/telebirr/initiate',
    protect,
    validateTelebirrInitiate,
    paymentController.initiateTelebirrPayment
);

/**
 * Telebirr payment callback/webhook
 * POST /api/v1/payments/telebirr/callback
 * Body: { transaction_id, status, amount, ... }
 * Access: Public (webhook endpoint - should verify signature)
 */
router.post(
    '/telebirr/callback',
    paymentController.handleTelebirrCallback
);

/**
 * Check Telebirr payment status
 * GET /api/v1/payments/telebirr/status/:transactionId
 * Access: Authenticated users
 */
router.get(
    '/telebirr/status/:transactionId',
    protect,
    validateTransactionId,
    paymentController.checkTelebirrPaymentStatus
);

/**
 * Confirm cash payment
 * POST /api/v1/payments/cash/confirm/:orderId
 * Access: Driver only
 */
router.post(
    '/cash/confirm/:orderId',
    protect,
    paymentController.confirmCashPayment
);

/**
 * Get payment details
 * GET /api/v1/payments/:orderId
 * Access: Customer, Driver, Restaurant (for their own orders)
 */
router.get(
    '/:orderId',
    protect,
    paymentController.getPaymentDetails
);

module.exports = router;
