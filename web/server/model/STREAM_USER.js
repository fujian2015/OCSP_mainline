/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('STREAM_USER', {
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
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    createdAt: false,
    updatedAt: false,
    tableName: 'STREAM_USER'
  });
};
