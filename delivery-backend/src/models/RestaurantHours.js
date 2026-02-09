const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RestaurantHours = sequelize.define('RestaurantHours', {
    hours_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    restaurant_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    day_of_week: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    opening_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    closing_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    is_closed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'restaurant_hours',
    timestamps: false,
    indexes: [
        { unique: true, name: 'unique_restaurant_day', fields: ['restaurant_id', 'day_of_week'] }
    ]
});

module.exports = RestaurantHours;
