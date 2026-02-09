const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FinancialReport = sequelize.define('FinancialReport', {
    report_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    report_type: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
        allowNull: false
    },
    report_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    total_orders: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    total_revenue: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    total_delivery_fees: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    total_service_fees: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    total_driver_tips: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    total_discounts: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    total_refunds: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    net_revenue: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    commission_to_restaurants: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    payments_to_drivers: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    platform_profit: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    generated_by_admin: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'financial_reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        { name: 'idx_report_date', fields: ['report_date'] },
        { name: 'idx_report_type', fields: ['report_type'] }
    ]
});

module.exports = FinancialReport;
