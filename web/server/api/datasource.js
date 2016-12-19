var express = require('express');
var sequelize = require('../sequelize');
var Sequelize = require('sequelize');
var Datasource = require('../model/STREAM_DATASOURCE')(sequelize, Sequelize);
var config = require('../config');
var trans = config[config.trans || 'zh'];

var router = express.Router();

router.get('/', function(req, res){
  Datasource.findAll().then(function (datasource){
    res.send(datasource);
  }, function(){
    res.status(500).send(trans.databaseError);
  });
});

router.post('/', function (req, res) {
  var datasources = req.body.data;
  var promises = [];
  for(var i in datasources){
    promises.push(Datasource.update(datasources[i], {where : {id: datasources[i].id}}));
  }
  sequelize.Promise.all(promises).then(function(){
    res.send({success: true});
  },function(){
    res.status(500).send(trans.databaseError);
  }).catch(function(){
    res.status(500).send(trans.databaseError);
  })
});

module.exports = router;
