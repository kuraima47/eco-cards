const DataTypes = require('sequelize');
const sequelize = require('../config/db');

const Session = sequelize.define('Session', {
    sessionId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'sessionid'
    },
    adminId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'adminid'
    },
    sessionName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'sessionname'
    },
    deckId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'deckid'
    },
    phase: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'phase'
    },
    round: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'round'
    },
    status: {
        type: DataTypes.ENUM('active', 'pending', 'closed'),
        allowNull: false,
        defaultValue: 'active',
        field: 'status'
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'createdat'
    },
    endedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'endedat'
    }
}, {
    tableName: 'sessions',
    timestamps: false,
    freezeTableName: true
});

module.exports = Session;