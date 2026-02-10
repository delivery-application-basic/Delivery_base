const { Order, DriverWallet } = require('../models');
const { ORDER_STATUS } = require('../utils/constants');

/**
 * Upload restaurant receipt (non-partnered orders)
 * @param {number} orderId - Order ID
 * @param {string} receiptUrl - URL of uploaded receipt image
 * @param {number} actualAmount - Actual amount paid to restaurant (optional, can be extracted from receipt)
 * @param {number} driverId - Driver ID (from authenticated user)
 * @returns {Promise<Object>} Receipt details
 */
async function uploadRestaurantReceipt(orderId, receiptUrl, actualAmount, driverId) {
    const order = await Order.findByPk(orderId);
    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }

    if (order.order_flow_type !== 'non_partnered') {
        const err = new Error('Receipt upload is only for non-partnered orders');
        err.statusCode = 400;
        throw err;
    }

    if (order.driver_id !== driverId) {
        const err = new Error('Only the assigned driver can upload receipt');
        err.statusCode = 403;
        throw err;
    }

    if (!actualAmount || actualAmount <= 0) {
        const err = new Error('Actual amount is required');
        err.statusCode = 400;
        throw err;
    }

    // Update order with receipt
    await order.update({
        restaurant_receipt_url: receiptUrl,
        actual_total_amount: parseFloat(actualAmount),
        driver_paid_amount: parseFloat(actualAmount),
        driver_paid_at: new Date(),
        reimbursement_status: 'pending'
    });

    return {
        order_id: orderId,
        receipt_url: receiptUrl,
        actual_total_amount: actualAmount,
        reimbursement_status: 'pending',
        message: 'Receipt uploaded successfully. Waiting for admin approval.'
    };
}

/**
 * Approve receipt and process reimbursement
 * @param {number} orderId - Order ID
 * @param {number} adminId - Admin ID approving
 * @param {number} adjustedAmount - Optional: Admin can adjust actual amount
 * @returns {Promise<Object>} Approval details
 */
async function approveReceipt(orderId, adminId, adjustedAmount = null) {
    const order = await Order.findByPk(orderId);
    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }

    if (order.order_flow_type !== 'non_partnered') {
        const err = new Error('Receipt approval is only for non-partnered orders');
        err.statusCode = 400;
        throw err;
    }

    if (!order.restaurant_receipt_url) {
        const err = new Error('No receipt uploaded for this order');
        err.statusCode = 400;
        throw err;
    }

    if (order.reimbursement_status === 'completed') {
        const err = new Error('Receipt already processed');
        err.statusCode = 400;
        throw err;
    }

    // Use adjusted amount if provided, otherwise use actual_amount
    const finalAmount = adjustedAmount !== null ? parseFloat(adjustedAmount) : parseFloat(order.actual_total_amount);

    // Update order
    await order.update({
        actual_total_amount: finalAmount,
        reimbursement_status: 'approved'
    });

    // Process reimbursement
    const { reimburseDriver } = require('./paymentFlowService');
    const reimbursement = await reimburseDriver(orderId);

    return {
        order_id: orderId,
        receipt_url: order.restaurant_receipt_url,
        actual_total_amount: finalAmount,
        reimbursement_status: 'approved',
        reimbursement_details: reimbursement,
        message: 'Receipt approved and driver reimbursed'
    };
}

/**
 * Reject receipt
 * @param {number} orderId - Order ID
 * @param {number} adminId - Admin ID rejecting
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Rejection details
 */
async function rejectReceipt(orderId, adminId, reason) {
    const order = await Order.findByPk(orderId);
    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }

    if (order.order_flow_type !== 'non_partnered') {
        const err = new Error('Receipt rejection is only for non-partnered orders');
        err.statusCode = 400;
        throw err;
    }

    if (!reason || reason.trim().length === 0) {
        const err = new Error('Rejection reason is required');
        err.statusCode = 400;
        throw err;
    }

    // Update order
    await order.update({
        reimbursement_status: 'rejected',
        cancellation_reason: reason // Reuse cancellation_reason field for rejection reason
    });

    return {
        order_id: orderId,
        reimbursement_status: 'rejected',
        rejection_reason: reason,
        message: 'Receipt rejected. Admin will manually process reimbursement.'
    };
}

/**
 * Get receipt details
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Receipt details
 */
async function getReceiptDetails(orderId) {
    const order = await Order.findByPk(orderId);
    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }

    if (order.order_flow_type !== 'non_partnered') {
        const err = new Error('Receipt details are only for non-partnered orders');
        err.statusCode = 400;
        throw err;
    }

    return {
        order_id: orderId,
        receipt_url: order.restaurant_receipt_url,
        estimated_total_amount: parseFloat(order.estimated_total_amount || order.total_amount),
        actual_total_amount: order.actual_total_amount ? parseFloat(order.actual_total_amount) : null,
        driver_paid_amount: order.driver_paid_amount ? parseFloat(order.driver_paid_amount) : null,
        driver_paid_at: order.driver_paid_at,
        reimbursement_status: order.reimbursement_status,
        difference: order.actual_total_amount ? 
            parseFloat(order.estimated_total_amount || order.total_amount) - parseFloat(order.actual_total_amount) : null
    };
}

module.exports = {
    uploadRestaurantReceipt,
    approveReceipt,
    rejectReceipt,
    getReceiptDetails
};
