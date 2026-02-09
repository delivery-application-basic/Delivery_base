const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
    notification_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_type: {
        type: DataTypes.ENUM('customer', 'restaurant', 'driver', 'admin'),
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    notification_type: {
        type: DataTypes.STRING(50)
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    related_order_id: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        { name: 'idx_notification_user', fields: ['user_type', 'user_id'] },
        { name: 'idx_notification_read', fields: ['is_read'] }
    ]
});

module.exports = Notification;
