const DataTypes = require('sequelize');
const sequelize = require('../config/db');

const Category = sequelize.define('Category', {
    categoryId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'categoryid'
    },
    categoryName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'categoryname'
    },
    categoryDescription: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'categorydescription'
    },
    categoryIcon: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'categoryicon'
    },
    categoryColor: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'categorycolor'
    },
    deckId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'deckid'
    }
}, {
    tableName: 'categories',
    timestamps: false,
    freezeTableName: true
});

module.exports = Category;
