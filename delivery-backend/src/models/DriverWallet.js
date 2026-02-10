const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DriverWallet = sequelize.define('DriverWallet', {
    wallet_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    driver_id: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
    },
    pending_balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
    },
    total_deposited: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
    },
    total_withdrawn: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
    }
}, {
    tableName: 'driver_wallets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { name: 'idx_driver_wallet', fields: ['driver_id'] }
    ]
});

// Instance methods
DriverWallet.prototype.deposit = async function(amount, isPending = false) {
    const numAmount = parseFloat(amount);
    if (isPending) {
        this.pending_balance = parseFloat(this.pending_balance) + numAmount;
    } else {
        this.balance = parseFloat(this.balance) + numAmount;
    }
    this.total_deposited = parseFloat(this.total_deposited) + numAmount;
    await this.save();
    return this;
};

DriverWallet.prototype.withdraw = async function(amount) {
    const numAmount = parseFloat(amount);
    const currentBalance = parseFloat(this.balance);
    if (currentBalance < numAmount) {
        throw new Error('Insufficient balance');
    }
    this.balance = currentBalance - numAmount;
    this.total_withdrawn = parseFloat(this.total_withdrawn) + numAmount;
    await this.save();
    return this;
};

DriverWallet.prototype.movePendingToBalance = async function(amount) {
    const numAmount = parseFloat(amount);
    const currentPending = parseFloat(this.pending_balance);
    if (currentPending < numAmount) {
        throw new Error('Insufficient pending balance');
    }
    this.pending_balance = currentPending - numAmount;
    this.balance = parseFloat(this.balance) + numAmount;
    await this.save();
    return this;
};

DriverWallet.prototype.getAvailableBalance = function() {
    return parseFloat(this.balance);
};

DriverWallet.prototype.getPendingBalance = function() {
    return parseFloat(this.pending_balance);
};

module.exports = DriverWallet;
