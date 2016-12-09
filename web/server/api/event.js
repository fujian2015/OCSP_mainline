var express = require('express');
var sequelize = require('../sequelize');
var Sequelize = require('sequelize');
var Event = require('../model/STREAM_EVENT')(sequelize, Sequelize);

var router = express.Router();

router.get('/diid/:id', function(req, res){
  Event.findAll({
    where:{
      diid : req.params.id
    }
  }).then(function (events){
    res.send(events);
  }, function(err){
    res.status(500).send(err);
  })
});


module.exports = router;
