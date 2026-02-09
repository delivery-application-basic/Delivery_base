const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DisputeMessage = sequelize.define('DisputeMessage', {
    message_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    dispute_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sender_type: {
        type: DataTypes.ENUM('admin', 'customer', 'restaurant', 'driver'),
        allowNull: false
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    attachment_url: {
        type: DataTypes.STRING(255)
    }
}, {
    tableName: 'dispute_messages'
});

module.exports = DisputeMessage;
