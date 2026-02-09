const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Dispute = sequelize.define('Dispute', {
    dispute_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    raised_by_type: {
        type: DataTypes.ENUM('customer', 'restaurant', 'driver'),
        allowNull: false
    },
    raised_by_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    dispute_type: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    subject: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    evidence_url: {
        type: DataTypes.STRING(255)
    },
    status: {
        type: DataTypes.ENUM('open', 'in_review', 'resolved', 'rejected'),
        defaultValue: 'open'
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium'
    },
    assigned_to_admin: {
        type: DataTypes.INTEGER
    },
    resolution_notes: {
        type: DataTypes.TEXT
    },
    refund_amount: {
        type: DataTypes.DECIMAL(10, 2)
    },
    resolved_at: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'disputes'
});

module.exports = Dispute;
