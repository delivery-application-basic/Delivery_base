const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MenuItem = sequelize.define('MenuItem', {
    item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    restaurant_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    item_name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    category: {
        type: DataTypes.STRING(100)
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    image_url: {
        type: DataTypes.STRING(255)
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_vegetarian: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_spicy: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    preparation_time: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'menu_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { name: 'idx_menu_restaurant', fields: ['restaurant_id'] },
        { name: 'idx_menu_category', fields: ['category'] },
        { name: 'idx_menu_available', fields: ['is_available'] }
    ]
});

module.exports = MenuItem;
