const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DriverLocationHistory = sequelize.define('DriverLocationHistory', {
    location_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    driver_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8)
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8)
    },
    recorded_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'driver_location_history'
});

module.exports = DriverLocationHistory;
