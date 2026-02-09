const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PromoCodeUsage = sequelize.define('PromoCodeUsage', {
    usage_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    promo_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    discount_applied: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    used_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'promo_code_usage',
    timestamps: false,
    indexes: [
        { name: 'idx_usage_promo', fields: ['promo_id'] },
        { name: 'idx_usage_customer', fields: ['customer_id'] }
    ]
});

module.exports = PromoCodeUsage;
