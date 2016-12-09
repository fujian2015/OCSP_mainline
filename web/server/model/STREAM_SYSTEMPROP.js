/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('STREAM_SYSTEMPROP', {
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
    value: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER(16),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    createdAt: false,
    updatedAt: false,
    tableName: 'STREAM_SYSTEMPROP'
  });
};
