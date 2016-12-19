var express = require('express');
var sequelize = require('../sequelize');
var Sequelize = require('sequelize');
var Event = require('../model/STREAM_EVENT')(sequelize, Sequelize);
var config = require('../config');
var trans = config[config.trans || 'zh'];

var router = express.Router();

router.get('/diid/:id', function(req, res){
  Event.findAll({
    where:{
      diid : req.params.id
    }
  }).then(function (events){
    res.send(events);
  }, function(){
    res.status(500).send(trans.databaseError);
  })
});


module.exports = router;
