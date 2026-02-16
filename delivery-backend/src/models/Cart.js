const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cart = sequelize.define('Cart', {
    cart_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    restaurant_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'carts',
    timestamps: true,
    updatedAt: 'updated_at',
    createdAt: false,
    indexes: [
        { name: 'idx_cart_customer', fields: ['customer_id'] },
        { name: 'idx_cart_restaurant', fields: ['restaurant_id'] }
    ]
});

module.exports = Cart;
