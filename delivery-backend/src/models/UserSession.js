const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserSession = sequelize.define('UserSession', {
    session_id: {
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
    refresh_token: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false
    },
    device_info: {
        type: DataTypes.STRING(255)
    },
    ip_address: {
        type: DataTypes.STRING(45)
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'user_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = UserSession;
