const DataTypes = require('sequelize');
const sequelize = require('../config/db');

const DeckContent = sequelize.define('DeckContent', {
    deckId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'deckid'
    },
    cardId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'cardid'
    }
}, {
    tableName: 'deckcontents',
    timestamps: false,
    freezeTableName: true
});

module.exports = DeckContent;