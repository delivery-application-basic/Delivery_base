const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Address = sequelize.define('Address', {
    address_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    address_label: {
        type: DataTypes.STRING(50)
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
    woreda: {
        type: DataTypes.STRING(100)
    },
    house_number: {
        type: DataTypes.STRING(50)
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
    is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'customer_addresses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        { name: 'idx_addr_customer', fields: ['customer_id'] }
    ]
});

module.exports = Address;
