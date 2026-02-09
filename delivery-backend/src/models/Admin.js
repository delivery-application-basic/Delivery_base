const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Admin = sequelize.define('Admin', {
    admin_id: {
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
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    phone_number: {
        type: DataTypes.STRING(20),
        unique: true
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('super_admin', 'admin', 'moderator', 'support'),
        defaultValue: 'admin'
    },
    profile_picture_url: {
        type: DataTypes.STRING(255)
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    last_login: {
        type: DataTypes.DATE
    },
    created_by: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'admins',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { name: 'idx_admin_email', fields: ['email'] },
        { name: 'idx_admin_role', fields: ['role'] },
        { name: 'idx_admin_active', fields: ['is_active'] }
    ],
    hooks: {
        beforeCreate: async (admin) => {
            if (admin.password_hash) {
                const salt = await bcrypt.genSalt(10);
                admin.password_hash = await bcrypt.hash(admin.password_hash, salt);
            }
        },
        beforeUpdate: async (admin) => {
            if (admin.changed('password_hash')) {
                const salt = await bcrypt.genSalt(10);
                admin.password_hash = await bcrypt.hash(admin.password_hash, salt);
            }
        }
    }
});

Admin.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = Admin;
