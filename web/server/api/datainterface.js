var express = require('express');
var sequelize = require('../sequelize');
var Sequelize = require('sequelize');
var DataInterface = require('../model/STREAM_DATAINTERFACE')(sequelize, Sequelize);

var router = express.Router();

router.get('/', function(req, res){
  DataInterface.findAll().then(function (datainterface){
    res.send(datainterface);
  }, function(err){
    res.status(500).send(err);
  });
});

router.get('/exist/:name', function(req, res){
  DataInterface.find({where: {name: req.params.name}}).then(function (data) {
    if(data !== null && data !== undefined && data.dataValues !== undefined){
      res.send({name: req.params.name, find: true});
    }else{
      res.send({name: req.params.name, find: false});
    }
  }, function(err){
    res.status(500).send(err);
  });
});

router.get('/output', function(req, res){
  DataInterface.findAll({
    where:{
      type: 1
    }
  }).then(function (datainterface){
    res.send(datainterface);
  }, function(err){
    res.status(500).send(err);
  })
});

router.get('/:id', function(req, res){
  DataInterface.findAll({
    where:{
      id : req.params.id
    }
  }).then(function (datainterface){
    res.send(datainterface);
  }, function(err){
    res.status(500).send(err);
  })
});

module.exports = router;
