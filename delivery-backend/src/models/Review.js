const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define('Review', {
    review_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    restaurant_id: {
        type: DataTypes.INTEGER
    },
    driver_id: {
        type: DataTypes.INTEGER
    },
    review_type: {
        type: DataTypes.ENUM('restaurant', 'driver'),
        allowNull: false
    },
    rating: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comment: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'reviews',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { name: 'idx_review_restaurant', fields: ['restaurant_id'] },
        { name: 'idx_review_driver', fields: ['driver_id'] },
        { name: 'idx_review_rating', fields: ['rating'] },
        { unique: true, name: 'unique_order_type', fields: ['order_id', 'review_type'] }
    ]
});

module.exports = Review;
