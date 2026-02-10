const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Restaurant = sequelize.define('Restaurant', {
    restaurant_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    restaurant_name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        unique: true
    },
    phone_number: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    street_address: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    sub_city: {
        type: DataTypes.STRING(100)
    },
    landmark: {
        type: DataTypes.STRING(255)
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8)
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8)
    },
    cuisine_type: {
        type: DataTypes.STRING(100)
    },
    logo_url: {
        type: DataTypes.STRING(255)
    },
    cover_image_url: {
        type: DataTypes.STRING(255)
    },
    description: {
        type: DataTypes.TEXT
    },
    average_rating: {
        type: DataTypes.DECIMAL(2, 1),
        defaultValue: 0.0
    },
    total_reviews: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    verification_status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    verified_by: {
        type: DataTypes.INTEGER
    },
    verified_at: {
        type: DataTypes.DATE
    },
    rejection_reason: {
        type: DataTypes.TEXT
    },
    minimum_order_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    delivery_fee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    estimated_delivery_time: {
        type: DataTypes.INTEGER
    },
    commission_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 15.00
    },
    happy_hour_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    happy_hour_start_time: {
        type: DataTypes.STRING(5), // Format: "HH:MM" e.g., "14:00"
        defaultValue: null
    },
    happy_hour_end_time: {
        type: DataTypes.STRING(5), // Format: "HH:MM" e.g., "17:00"
        defaultValue: null
    },
    happy_hour_discount_percent: {
        type: DataTypes.DECIMAL(5, 2), // e.g., 10.00 for 10%, 30.00 for 30%
        defaultValue: 0
    },
    happy_hour_days: {
        type: DataTypes.JSON, // Array of day numbers: [0,1,2,3,4] for Sun-Thu, [1,2,3,4,5] for Mon-Fri, etc.
        // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
        defaultValue: null // null means applies to all days if enabled
    },
    happy_hour_start_date: {
        type: DataTypes.DATE, // Optional: when happy hour promotion starts (null = no start date limit)
        defaultValue: null
    },
    happy_hour_end_date: {
        type: DataTypes.DATE, // Optional: when happy hour promotion ends (null = no end date limit)
        defaultValue: null
    }
}, {
    tableName: 'restaurants',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { name: 'idx_cuisine', fields: ['cuisine_type'] },
        { name: 'idx_city', fields: ['city'] },
        { name: 'idx_rest_active', fields: ['is_active'] },
        { name: 'idx_verification_status', fields: ['verification_status'] }
    ],
    hooks: {
        beforeCreate: async (restaurant) => {
            if (restaurant.password_hash) {
                const salt = await bcrypt.genSalt(10);
                restaurant.password_hash = await bcrypt.hash(restaurant.password_hash, salt);
            }
        },
        beforeUpdate: async (restaurant) => {
            if (restaurant.changed('password_hash')) {
                const salt = await bcrypt.genSalt(10);
                restaurant.password_hash = await bcrypt.hash(restaurant.password_hash, salt);
            }
        }
    }
});

Restaurant.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = Restaurant;
