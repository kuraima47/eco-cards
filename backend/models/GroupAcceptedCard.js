const DataTypes = require('sequelize');
const sequelize = require('../config/db');

const GroupAcceptedCard = sequelize.define('GroupAcceptedCard', {
    groupId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'groupid'
    },
    cardId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'cardid'
    },
    co2estimation: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "co2estimation",
    },
    acceptancelevel: {
        type: DataTypes.STRING(10),
        allowNull: true,
        field: "acceptancelevel",
        validate: {
            isIn: [["high", "medium", "low", null]],
        },
    }
}, {
    tableName: 'groupacceptedcards',
    timestamps: false,
});

module.exports = GroupAcceptedCard;