var express = require('express');
var sequelize = require('../sequelize');
var Sequelize = require('sequelize');
var Datasource = require('../model/STREAM_DATASOURCE')(sequelize, Sequelize);
var config = require('../config');
var trans = config[config.trans || 'zh'];

var router = express.Router();

router.get('/', function(req, res){
  Datasource.findAll({where: {status : {'$gt' : 0}}}).then(function (datasource){
    res.send(datasource);
  }, function(){
    res.status(500).send(trans.databaseError);
  });
});

router.post('/', function (req, res) {
  var datasource = req.body.data;
  sequelize.transaction(function(t) {
    datasource.status = 2;//can be deleted
    if (datasource.type === 'kafka') {
      return Datasource.find({where: {id: 1}, transaction: t}).then(function (data) {
        datasource.properties = JSON.parse(data.properties);
        for(var i in datasource.properties){
          if(datasource.properties[i].pname === 'zookeeper.connect'){
            datasource.properties[i].pvalue = datasource.zk;
          }else if(datasource.properties[i].pname === 'metadata.broker.list'){
            datasource.properties[i].pvalue = datasource.blist;
          }
        }
        datasource.properties = JSON.stringify(datasource.properties);
        return Datasource.create(datasource, {transaction: t});
      });
    } else if (datasource.type === 'codis') {
      return Datasource.find({where: {id: 2}, transaction: t}).then(function (data) {
        datasource.properties = JSON.parse(data.properties);
        for(var i in datasource.properties){
          if(datasource.properties[i].pname === 'zk'){
            datasource.properties[i].pvalue = datasource.zk;
          }else if(datasource.properties[i].pname === 'zkpath'){
            datasource.properties[i].pvalue = datasource.zkpath;
          }
        }
        datasource.properties = JSON.stringify(datasource.properties);
        return Datasource.create(datasource, {transaction: t});
      });
    }
  }).then(function(){
    res.send({success: true});
  },function(){
    res.status(500).send(trans.databaseError);
  }).catch(function () {
    res.status(500).send(trans.databaseError);
  });
});

router.put('/', function (req, res) {
  var datasources = req.body.data;
  sequelize.transaction(function(t) {
    var promises = [];
    return Datasource.findAll({where: {status: 2}, transaction: t}).then(function (items) {
      for (var i in datasources) {
        promises.push(Datasource.update(datasources[i], {where: {id: datasources[i].id}, transaction: t}));
      }
      for (var i in items) {
        var flag = false;
        for (var j in datasources) {
          if (items[i].dataValues.id === datasources[j].id) {
            flag = true;
            break;
          }
        }
        if (!flag) {
          items[i].dataValues.status = 0;
          promises.push(Datasource.update(items[i].dataValues, {where: {id: items[i].dataValues.id}, transaction: t}));
        }
      }
      return sequelize.Promise.all(promises);
    });
  }).then(function(){
    res.send({success: true});
  },function(){
    res.status(500).send(trans.databaseError);
  }).catch(function () {
    res.status(500).send(trans.databaseError);
  });
});

module.exports = router;
