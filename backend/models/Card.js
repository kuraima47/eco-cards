const DataTypes = require('sequelize');
const sequelize = require('../config/db');

const Card = sequelize.define('Card', {
    cardId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'cardid'
    },
    cardName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'cardname'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'carddescription'
    },
    cardActual: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'cardactual'
    },
    cardProposition: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'cardproposition'
    },
    cardImageData: {
        type: DataTypes.BLOB('long'),
        allowNull: true,
        field: 'cardimagedata'
    },
    cardCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'cardcategoryid'
    },
    cardValue: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'cardvalue'
    },
    times_selected: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: "times_selected"
    },
    qrCodeLogoImageData: {
        type: DataTypes.BLOB('long'),
        allowNull: true,
        field: 'qrcodelogoimagedata'
    },
    qrCodeColor: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'qrcodecolor'
    },
    backgroundColor: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'backgroundcolor'
    }
}, {
    tableName: 'cards',
    timestamps: false,
    freezeTableName: true
});

module.exports = Card;