const DataTypes = require('sequelize');
const sequelize = require('../config/db');

const Deck = sequelize.define('Deck', {
    deckId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'deckid'
    },
    deckName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'deckname'
    },
    adminId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'adminid'
    }
}, {
    tableName: 'decks',
    timestamps: false,
    freezeTableName: true
});

module.exports = Deck;