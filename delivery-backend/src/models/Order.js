const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
    order_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    restaurant_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    driver_id: {
        type: DataTypes.INTEGER
    },
    address_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    delivery_fee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    service_fee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    driver_tip: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    order_status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'in_transit', 'delivered', 'cancelled'),
        defaultValue: 'pending'
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending'
    },
    payment_method: {
        type: DataTypes.ENUM('cash', 'telebirr', 'cbebirr', 'card', 'bank_transfer'),
        allowNull: false
    },
    special_instructions: {
        type: DataTypes.TEXT
    },
    estimated_delivery_time: {
        type: DataTypes.DATE
    },
    order_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    confirmed_at: {
        type: DataTypes.DATE
    },
    delivered_at: {
        type: DataTypes.DATE
    },
    cancelled_at: {
        type: DataTypes.DATE
    },
    cancellation_reason: {
        type: DataTypes.TEXT
    },
    order_flow_type: {
        type: DataTypes.ENUM('partnered', 'non_partnered'),
        defaultValue: 'partnered'
    },
    restaurant_receipt_url: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    actual_total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    driver_paid_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    driver_paid_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    reimbursement_status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
        allowNull: true
    },
    estimated_total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    }
}, {
    tableName: 'orders',
    timestamps: false, // timestamps are explicitly handled by schema
    indexes: [
        { name: 'idx_order_customer', fields: ['customer_id'] },
        { name: 'idx_order_restaurant', fields: ['restaurant_id'] },
        { name: 'idx_order_driver', fields: ['driver_id'] },
        { name: 'idx_order_status', fields: ['order_status'] },
        { name: 'idx_order_date', fields: ['order_date'] }
    ]
});

module.exports = Order;
