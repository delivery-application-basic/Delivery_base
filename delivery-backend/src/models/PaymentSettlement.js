const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PaymentSettlement = sequelize.define('PaymentSettlement', {
    settlement_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    recipient_type: {
        type: DataTypes.ENUM('restaurant', 'driver'),
        allowNull: false
    },
    recipient_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    settlement_period_start: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    settlement_period_end: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    total_orders: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    gross_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    commission_amount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    net_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    payment_method: {
        type: DataTypes.ENUM('bank_transfer', 'cash', 'mobile_money'),
        allowNull: false
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
        defaultValue: 'pending'
    },
    transaction_reference: {
        type: DataTypes.STRING(100)
    },
    processed_by_admin: {
        type: DataTypes.INTEGER
    },
    processed_at: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'payment_settlements'
});

module.exports = PaymentSettlement;
