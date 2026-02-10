const express = require('express');
const router = express.Router();
const {
    getWallet,
    getTransactions
} = require('../controllers/walletController');
const { protect, authorize } = require('../middleware/auth');
const { USER_TYPES } = require('../utils/constants');

/**
 * Get driver wallet balance
 * GET /api/v1/drivers/wallet
 * Access: Driver only
 */
router.get(
    '/wallet',
    protect,
    authorize(USER_TYPES.DRIVER),
    getWallet
);

/**
 * Get wallet transactions
 * GET /api/v1/drivers/wallet/transactions
 * Access: Driver only
 */
router.get(
    '/wallet/transactions',
    protect,
    authorize(USER_TYPES.DRIVER),
    getTransactions
);

module.exports = router;
