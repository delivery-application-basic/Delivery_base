const { DriverWallet } = require('../models');
const { USER_TYPES } = require('../utils/constants');

/**
 * Get driver wallet balance
 * GET /api/v1/drivers/wallet
 * Access: Driver only
 */
exports.getWallet = async (req, res) => {
    try {
        const driverId = req.user.driver_id;

        if (!driverId) {
            return res.status(401).json({
                success: false,
                message: 'Driver authentication required'
            });
        }

        let wallet = await DriverWallet.findOne({ where: { driver_id: driverId } });
        
        // Create wallet if it doesn't exist
        if (!wallet) {
            wallet = await DriverWallet.create({
                driver_id: driverId,
                balance: 0,
                pending_balance: 0,
                total_deposited: 0,
                total_withdrawn: 0
            });
        }

        res.status(200).json({
            success: true,
            data: {
                wallet_id: wallet.wallet_id,
                driver_id: driverId,
                balance: parseFloat(wallet.balance),
                pending_balance: parseFloat(wallet.pending_balance),
                total_deposited: parseFloat(wallet.total_deposited),
                total_withdrawn: parseFloat(wallet.total_withdrawn),
                available_balance: wallet.getAvailableBalance(),
                total_earnings: parseFloat(wallet.balance) + parseFloat(wallet.total_withdrawn)
            }
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to get wallet balance'
        });
    }
};

/**
 * Get wallet transactions (from payments)
 * GET /api/v1/drivers/wallet/transactions
 * Access: Driver only
 */
exports.getTransactions = async (req, res) => {
    try {
        const driverId = req.user.driver_id;
        const { Payment } = require('../models');

        if (!driverId) {
            return res.status(401).json({
                success: false,
                message: 'Driver authentication required'
            });
        }

        const transactions = await Payment.findAll({
            where: {
                recipient_type: 'driver',
                recipient_id: driverId
            },
            order: [['payment_date', 'DESC']],
            limit: 50
        });

        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions.map(t => ({
                payment_id: t.payment_id,
                order_id: t.order_id,
                amount: parseFloat(t.amount),
                payment_type: t.payment_type,
                payment_method: t.payment_method,
                payment_status: t.payment_status,
                payment_date: t.payment_date
            }))
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to get transactions'
        });
    }
};
