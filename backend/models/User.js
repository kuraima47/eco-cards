const DataTypes = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User ', { 
    userId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'userid'
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'username'
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'email'
    },
    userPassword: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'user_password'
    },
    role: {
        type: DataTypes.ENUM('admin', 'player'),
        allowNull: false,
        defaultValue: 'player',
        field: 'role'
    }
}, {
    tableName: 'users',
    timestamps: false,
    freezeTableName: true
});

module.exports = User;