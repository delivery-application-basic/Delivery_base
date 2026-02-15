/**
 * Clear all orders and related data for a fresh start.
 * Run from delivery-backend: node scripts/clearOrders.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const { Op } = require('sequelize');
const {
    sequelize,
    OrderItem,
    OrderStatusHistory,
    DriverAssignment,
    Delivery,
    Payment,
    Review,
    PromoCodeUsage,
    Notification,
    Dispute,
    Order
} = require('../src/models');
// Ensure DB is connected (models use same sequelize from config)
const { connectDB } = require('../src/config/database');

async function clearOrders() {
    const t = await sequelize.transaction();
    try {
        const deleted = {};

        deleted.order_items = await OrderItem.destroy({ where: {}, transaction: t });
        deleted.order_status_history = await OrderStatusHistory.destroy({ where: {}, transaction: t });
        deleted.driver_assignments = await DriverAssignment.destroy({ where: {}, transaction: t });
        deleted.deliveries = await Delivery.destroy({ where: {}, transaction: t });
        deleted.payments = await Payment.destroy({ where: {}, transaction: t });
        deleted.reviews = await Review.destroy({ where: {}, transaction: t });
        deleted.promo_code_usages = await PromoCodeUsage.destroy({ where: {}, transaction: t });
        deleted.notifications = await Notification.destroy({
            where: { related_order_id: { [Op.ne]: null } },
            transaction: t
        });
        deleted.disputes = await Dispute.destroy({ where: {}, transaction: t });
        deleted.orders = await Order.destroy({ where: {}, transaction: t });

        await t.commit();
        console.log('Orders and related data cleared:');
        Object.entries(deleted).forEach(([table, count]) => console.log(`  ${table}: ${count} row(s)`));
        console.log('Done. Fresh start ready.');
    } catch (err) {
        await t.rollback();
        console.error('Failed to clear orders:', err.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

(async () => {
    await connectDB();
    await clearOrders();
})();
