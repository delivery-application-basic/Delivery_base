const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SystemSetting = sequelize.define('SystemSetting', {
    setting_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    setting_key: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false
    },
    setting_value: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    setting_type: {
        type: DataTypes.STRING(50)
    },
    description: {
        type: DataTypes.TEXT
    },
    updated_by_admin: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'system_settings'
});

module.exports = SystemSetting;
