const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PromoCode = sequelize.define('PromoCode', {
    promo_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(255)
    },
    discount_type: {
        type: DataTypes.ENUM('percentage', 'fixed_amount'),
        allowNull: false
    },
    discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    minimum_order_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    max_discount_amount: {
        type: DataTypes.DECIMAL(10, 2)
    },
    usage_limit: {
        type: DataTypes.INTEGER
    },
    usage_per_customer: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    valid_from: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    valid_until: {
        type: DataTypes.DATE,
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'promo_codes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        { name: 'idx_promo_code', fields: ['code'] },
        { name: 'idx_promo_active', fields: ['is_active'] }
    ]
});

module.exports = PromoCode;
