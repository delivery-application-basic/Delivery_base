const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Customer = sequelize.define('Customer', {
    customer_id: {
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
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    phone_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'customers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { name: 'idx_phone', fields: ['phone_number'] },
        { name: 'idx_email', fields: ['email'] }
    ],
    hooks: {
        beforeCreate: async (customer) => {
            if (customer.password_hash) {
                const salt = await bcrypt.genSalt(10);
                customer.password_hash = await bcrypt.hash(customer.password_hash, salt);
            }
        },
        beforeUpdate: async (customer) => {
            if (customer.changed('password_hash')) {
                const salt = await bcrypt.genSalt(10);
                customer.password_hash = await bcrypt.hash(customer.password_hash, salt);
            }
        }
    }
});

Customer.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = Customer;
