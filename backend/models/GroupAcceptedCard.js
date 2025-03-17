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
    }
}, {
    tableName: 'groupacceptedcards',
    timestamps: false,
});

module.exports = GroupAcceptedCard;