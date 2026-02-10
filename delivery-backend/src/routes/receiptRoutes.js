const express = require('express');
const router = express.Router();
const {
    uploadReceipt,
    approveReceipt,
    rejectReceipt,
    getReceipt
} = require('../controllers/receiptController');
const { protect, authorize } = require('../middleware/auth');
const { USER_TYPES } = require('../utils/constants');
const { param, body } = require('express-validator');
const { validationResult } = require('express-validator');

const validationHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

const validateOrderId = [
    param('orderId').isInt({ min: 1 }).withMessage('Valid order ID is required'),
    validationHandler
];

const validateUploadReceipt = [
    body('receipt_url').notEmpty().withMessage('receipt_url is required'),
    body('actual_amount').isFloat({ min: 0.01 }).withMessage('actual_amount must be greater than 0'),
    validationHandler
];

const validateRejectReceipt = [
    body('reason').trim().isLength({ min: 1 }).withMessage('Rejection reason is required'),
    validationHandler
];

/**
 * Upload restaurant receipt (non-partnered orders)
 * POST /api/v1/orders/:orderId/receipt
 * Access: Driver only
 */
router.post(
    '/:orderId/receipt',
    protect,
    authorize(USER_TYPES.DRIVER),
    validateOrderId,
    validateUploadReceipt,
    uploadReceipt
);

/**
 * Get receipt details
 * GET /api/v1/orders/:orderId/receipt
 * Access: Driver, Admin
 */
router.get(
    '/:orderId/receipt',
    protect,
    authorize(USER_TYPES.DRIVER, USER_TYPES.ADMIN),
    validateOrderId,
    getReceipt
);

/**
 * Approve receipt (admin)
 * PATCH /api/v1/admin/orders/:orderId/receipt/approve
 * Access: Admin only
 */
router.patch(
    '/:orderId/receipt/approve',
    protect,
    authorize(USER_TYPES.ADMIN),
    validateOrderId,
    approveReceipt
);

/**
 * Reject receipt (admin)
 * PATCH /api/v1/admin/orders/:orderId/receipt/reject
 * Access: Admin only
 */
router.patch(
    '/:orderId/receipt/reject',
    protect,
    authorize(USER_TYPES.ADMIN),
    validateOrderId,
    validateRejectReceipt,
    rejectReceipt
);

module.exports = router;
