const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Driver = sequelize.define('Driver', {
    driver_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    full_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        unique: true
    },
    phone_number: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    profile_picture_url: {
        type: DataTypes.STRING(255)
    },
    driver_license_number: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    driver_license_image_url: {
        type: DataTypes.STRING(255)
    },
    id_card_number: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    id_card_image_url: {
        type: DataTypes.STRING(255)
    },
    vehicle_type: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    vehicle_plate_number: {
        type: DataTypes.STRING(20),
        unique: true
    },
    vehicle_image_url: {
        type: DataTypes.STRING(255)
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    verification_status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'approved'
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
    current_latitude: {
        type: DataTypes.DECIMAL(10, 8)
    },
    current_longitude: {
        type: DataTypes.DECIMAL(11, 8)
    },
    average_rating: {
        type: DataTypes.DECIMAL(2, 1),
        defaultValue: 0.0
    },
    total_deliveries: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    total_earnings: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    last_seen_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'drivers',
    timestamps: true,
    createdAt: 'joined_at',
    updatedAt: 'updated_at',
    indexes: [
        { name: 'idx_driver_available', fields: ['is_available'] },
        { name: 'idx_driver_last_seen', fields: ['last_seen_at'] },
        { name: 'idx_driver_location', fields: ['current_latitude', 'current_longitude'] },
        { name: 'idx_driver_verification', fields: ['verification_status'] }
    ],
    hooks: {
        beforeCreate: async (driver) => {
            if (driver.password_hash) {
                const salt = await bcrypt.genSalt(10);
                driver.password_hash = await bcrypt.hash(driver.password_hash, salt);
            }
        },
        beforeUpdate: async (driver) => {
            if (driver.changed('password_hash')) {
                const salt = await bcrypt.genSalt(10);
                driver.password_hash = await bcrypt.hash(driver.password_hash, salt);
            }
        }
    }
});

Driver.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = Driver;
