var express = require('express');
var sequelize = require('../sequelize');
var Sequelize = require('sequelize');
var Datasource = require('../model/STREAM_DATASOURCE')(sequelize, Sequelize);

var router = express.Router();

router.get('/', function(req, res){
  Datasource.findAll().then(function (datasource){
    res.send(datasource);
  }, function(err){
    res.status(500).send(err);
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
  },function(err){
    res.status(500).send(err);
  }).catch(function(err){
    res.status(500).send(err);
  })
});

module.exports = router;
