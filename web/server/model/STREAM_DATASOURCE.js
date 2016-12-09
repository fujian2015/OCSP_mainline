/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('STREAM_DATASOURCE', {
    id: {
      type: DataTypes.INTEGER(16),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    properties: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    createdAt: false,
    updatedAt: false,
    tableName: 'STREAM_DATASOURCE'
  });
};
