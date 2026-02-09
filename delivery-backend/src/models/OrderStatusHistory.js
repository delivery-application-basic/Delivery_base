const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderStatusHistory = sequelize.define('OrderStatusHistory', {
    history_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    old_status: {
        type: DataTypes.STRING(50)
    },
    new_status: {
        type: DataTypes.STRING(50)
    },
    changed_by_type: {
        type: DataTypes.ENUM('system', 'customer', 'restaurant', 'driver', 'admin')
    },
    changed_by_id: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'order_status_history'
});

module.exports = OrderStatusHistory;
