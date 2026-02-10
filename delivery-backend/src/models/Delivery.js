const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Delivery = sequelize.define('Delivery', {
    delivery_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false
    },
    driver_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    pickup_address: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    pickup_latitude: {
        type: DataTypes.DECIMAL(10, 8)
    },
    pickup_longitude: {
        type: DataTypes.DECIMAL(11, 8)
    },
    delivery_address: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    delivery_latitude: {
        type: DataTypes.DECIMAL(10, 8)
    },
    delivery_longitude: {
        type: DataTypes.DECIMAL(11, 8)
    },
    distance_km: {
        type: DataTypes.DECIMAL(5, 2)
    },
    assigned_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    picked_up_at: {
        type: DataTypes.DATE
    },
    delivered_at: {
        type: DataTypes.DATE
    },
    delivery_status: {
        type: DataTypes.ENUM('assigned', 'heading_to_restaurant', 'at_restaurant', 'picked_up', 'in_transit', 'delivered', 'failed'),
        defaultValue: 'assigned'
    },
    delivery_proof_url: {
        type: DataTypes.STRING(255)
    },
    verification_code_used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    verification_attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'deliveries'
});

module.exports = Delivery;
