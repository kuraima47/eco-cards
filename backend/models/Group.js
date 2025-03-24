const DataTypes = require('sequelize');
const sequelize = require('../config/db');

const Group = sequelize.define('Group', {
    groupId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'groupid'
    },
    sessionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'sessionid'
    },
    groupName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'groupname'
    }
  }, {
    tableName: 'groups',
    timestamps: false
  });

module.exports = Group;