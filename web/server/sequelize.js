// sequelize config
var Sequelize = require('sequelize');
var config = require('./config');
var env = config.env || 'dev';
var sequelize = new Sequelize(config[env].mysql);

module.exports = sequelize;
