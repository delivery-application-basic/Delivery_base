const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DriverAssignment = sequelize.define('DriverAssignment', {
    assignment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    driver_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    assignment_status: {
        type: DataTypes.ENUM('offered', 'accepted', 'rejected', 'expired')
    },
    offered_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    responded_at: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'driver_assignments'
});

module.exports = DriverAssignment;
