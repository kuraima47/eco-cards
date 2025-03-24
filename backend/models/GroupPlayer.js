const DataTypes = require('sequelize');
const sequelize = require('../config/db');

const GroupPlayer = sequelize.define('GroupPlayer', {
    groupId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'groupid'
    },
    userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'userid'
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'username'
    }
}, {
    tableName: 'groupplayers',
    timestamps: false,
});

module.exports = GroupPlayer;