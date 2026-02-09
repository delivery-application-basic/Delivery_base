const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdminActivityLog = sequelize.define('AdminActivityLog', {
    log_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    admin_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    action_type: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    target_type: {
        type: DataTypes.STRING(50)
    },
    target_id: {
        type: DataTypes.INTEGER
    },
    description: {
        type: DataTypes.TEXT
    },
    ip_address: {
        type: DataTypes.STRING(45)
    }
}, {
    tableName: 'admin_activity_log'
});

module.exports = AdminActivityLog;
