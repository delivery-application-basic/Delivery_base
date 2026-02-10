const { uploadRestaurantReceipt, approveReceipt, rejectReceipt, getReceiptDetails } = require('../services/receiptService');
const { USER_TYPES } = require('../utils/constants');

/**
 * Upload restaurant receipt (non-partnered orders)
 * POST /api/v1/orders/:id/receipt
 * Access: Driver only
 */
exports.uploadReceipt = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { receipt_url, actual_amount } = req.body;
        const driverId = req.user.driver_id;

        if (!driverId) {
            return res.status(401).json({
                success: false,
                message: 'Driver authentication required'
            });
        }

        if (!receipt_url) {
            return res.status(400).json({
                success: false,
                message: 'receipt_url is required'
            });
        }

        if (!actual_amount || parseFloat(actual_amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'actual_amount is required and must be greater than 0'
            });
        }

        const result = await uploadRestaurantReceipt(
            parseInt(orderId),
            receipt_url,
            parseFloat(actual_amount),
            driverId
        );

        res.status(200).json({
            success: true,
            message: result.message,
            data: result
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to upload receipt'
        });
    }
};

/**
 * Approve receipt and process reimbursement
 * PATCH /api/v1/admin/orders/:id/receipt/approve
 * Access: Admin only
 */
exports.approveReceipt = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { adjusted_amount } = req.body;
        const adminId = req.user.admin_id || null;

        const result = await approveReceipt(
            parseInt(orderId),
            adminId,
            adjusted_amount ? parseFloat(adjusted_amount) : null
        );

        res.status(200).json({
            success: true,
            message: result.message,
            data: result
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to approve receipt'
        });
    }
};

/**
 * Reject receipt
 * PATCH /api/v1/admin/orders/:id/receipt/reject
 * Access: Admin only
 */
exports.rejectReceipt = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.admin_id || null;

        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const result = await rejectReceipt(parseInt(orderId), adminId, reason);

        res.status(200).json({
            success: true,
            message: result.message,
            data: result
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to reject receipt'
        });
    }
};

/**
 * Get receipt details
 * GET /api/v1/orders/:id/receipt
 * Access: Driver, Admin
 */
exports.getReceipt = async (req, res) => {
    try {
        const { orderId } = req.params;

        const result = await getReceiptDetails(parseInt(orderId));

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to get receipt details'
        });
    }
};
