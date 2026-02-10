const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
    payment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    driver_tip: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    payment_method: {
        type: DataTypes.ENUM('cash', 'telebirr', 'cbebirr', 'card', 'bank_transfer'),
        allowNull: false
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
        defaultValue: 'pending'
    },
    transaction_id: {
        type: DataTypes.STRING(100),
        unique: true
    },
    payment_date: {
        type: DataTypes.DATE
    },
    refund_amount: {
        type: DataTypes.DECIMAL(10, 2)
    },
    refund_date: {
        type: DataTypes.DATE
    },
    tip_paid_to_driver: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    tip_paid_date: {
        type: DataTypes.DATE
    },
    payment_type: {
        type: DataTypes.ENUM('customer_to_platform', 'platform_to_restaurant', 'platform_to_driver', 'driver_to_restaurant'),
        allowNull: true
    },
    recipient_type: {
        type: DataTypes.ENUM('restaurant', 'driver', 'platform'),
        allowNull: true
    },
    recipient_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'payments'
});

module.exports = Payment;
