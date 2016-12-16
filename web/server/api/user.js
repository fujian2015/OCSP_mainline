var express = require('express');
var sequelize = require('../sequelize');
var Sequelize = require('sequelize');
var User = require('../model/STREAM_USER')(sequelize, Sequelize);
var crypto = require('crypto');


var router = express.Router();

router.post('/login/:name', function (req, res) {
  var pass = crypto.createHash('md5').update(req.body.pass).digest("hex");
  User.find({where: {name: req.params.name, password: pass}}).then(function(user){
    if(user === null || user === undefined){
      res.send({status: false});
    }else{
      res.send({status: true});
    }
  }, function (err) {
    res.status(500).send(err);
  })
});

router.post('/change', function(req, res){
  var user = req.body.user;
  var pass = crypto.createHash('md5').update(user.oldPassword).digest("hex");
  User.find({where: {name: user.name, password: pass}}).then(function(data){
    if(data !== null && data !== undefined && data.dataValues !== undefined){
      user.password = crypto.createHash('md5').update(user.password).digest("hex");
      User.update(user, {where: {id: data.dataValues.id}}).then(function(){
        res.send({status: true});
      }, function(){
        res.send({status: false});
      })
    }else{
      res.send({status: false});
    }
  }, function(err){
    res.status(500).send(err);
  })
});

router.get('/md5/:str', function(req,res){
  res.send(crypto.createHash('md5').update(req.params.str).digest("hex"));
});

module.exports = router;
