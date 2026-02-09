const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Announcement = sequelize.define('Announcement', {
    announcement_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    target_audience: {
        type: DataTypes.ENUM('all', 'customers', 'restaurants', 'drivers'),
        allowNull: false
    },
    announcement_type: {
        type: DataTypes.ENUM('info', 'warning', 'promotion', 'maintenance'),
        defaultValue: 'info'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    start_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    end_date: {
        type: DataTypes.DATE
    },
    created_by_admin: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'announcements'
});

module.exports = Announcement;
