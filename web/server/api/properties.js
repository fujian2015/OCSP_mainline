var express = require('express');
var sequelize = require('../sequelize');
var Sequelize = require('sequelize');
var Prop = require('../model/STREAM_SYSTEMPROP')(sequelize, Sequelize);
var config = require('../config');
var trans = config[config.trans || 'zh'];

var router = express.Router();

router.get('/', function(req, res){
  Prop.findAll({where : {status: 1}}).then(function (properties){
    res.send(properties);
  }, function(){
    res.status(500).send(trans.databaseError);
  });
});

router.get('/spark', function(req,res){
  Prop.find({attributes: ['id','value'], where : {name: 'SPARK_HOME'}}).then(function (properties){
    res.send(properties);
  }, function(){
    res.status(500).send(trans.databaseError);
  });
});

router.post('/spark', function(req, res){
  var value = req.body.spark;
  sequelize.transaction(function(t) {
    return Prop.find({where : {name: 'SPARK_HOME'}}).then(function (task) {
      if(task === null || task === undefined){
        return Prop.create({value: value, status : 1, name: "SPARK_HOME"},{transaction: t});
      }else {
        var result = task.dataValues;
        result.value = value;
        return Prop.update(result, {where: {id: task.id}, transaction: t});
      }
    });
  }).then(function(){
    res.send({success: true});
  },function(){
    res.status(500).send(trans.databaseError);
  }).catch(function () {
    res.status(500).send(trans.databaseError);
  });
});

router.post('/', function(req, res){
  var properties = req.body.data;
  var promises = [];
  for(var i in properties){
    promises.push(Prop.update(properties[i], {where : {id: properties[i].id}}));
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
