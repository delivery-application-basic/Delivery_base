const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CartItem = sequelize.define('CartItem', {
    cart_item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cart_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'cart_items',
    timestamps: false,
    indexes: [
        { name: 'idx_cart_item_cart', fields: ['cart_id'] },
        { name: 'idx_cart_item_menu', fields: ['item_id'] }
    ]
});

module.exports = CartItem;
