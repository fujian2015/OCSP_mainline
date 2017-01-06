var express = require('express');
var router = express.Router();
var multer  = require('multer');
var fs = require('fs');
var unzip = require('unzip2');
var sequelize = require('../sequelize');
var Sequelize = require('sequelize');
var Label = require('../model/STREAM_LABEL_DEFINITION')(sequelize, Sequelize);
var LabelRefer = require('../model/STREAM_LABEL')(sequelize, Sequelize);
var config = require('../config');
var path = require('path');
var trans = config[config.trans || 'zh'];

var storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
var upload = multer({ storage: storage });

router.get('/', function(req, res){
  Label.findAll().then(function (labels){
    res.send(labels);
  }, function(){
    res.status(500).send(trans.databaseError);
  });
});

router.post('/', function(req, res){
  var labels = req.body.labels;
  var promises = [];
  for(var i in labels){
    promises.push(Label.update(labels[i], {where : {id : labels[i].id}}));
  }
  sequelize.Promise.all(promises).then(function(){
    res.send({success : true});
  },function(){
    res.status(500).send(trans.databaseError);
  }).catch(function(err){
    res.status(500).send(trans.databaseError);
  });

});

router.get('/diid/:id', function(req, res){
  LabelRefer.findAll({
    where:{
      diid : req.params.id
    },
    order: '`p_label_id` ASC'
  }).then(function (labels){
    res.send(labels);
  }, function(){
    res.status(500).send(trans.databaseError);
  })
});

router.post('/upload', upload.single('file'), function(req, res){
  var promises = [];
  if(!req.file.originalname.endsWith('.jar')){
    promises.push(sequelize.Promise.reject("Upload file type wrong"));
  }
  fs.createReadStream('./uploads/' + req.file.originalname)
    .pipe(unzip.Parse())
    .once('error', function () {
      promises.push(sequelize.Promise.reject("Cannot parse file " + req.file.originalname));
    })
    .on('entry', function (entry) {
      var fileName = entry.path;
      if (fileName.endsWith('.class') && fileName.indexOf("$") === -1) {
        fileName = fileName.replace(/\.class/g, "");
        fileName = fileName.replace(/\//g, "\.");
        var index = fileName.lastIndexOf(".");
        promises.push(Label.findOrCreate({
          where: {name: fileName.substr(index + 1)},
          defaults: {class_name: fileName}
        }));
      }
    });
  sequelize.Promise.all(promises).then(function(){
    res.send({success: true});
  }, function(){
    res.status(500).send(trans.uploadError + path.join(__dirname,"../../uploads"));
  }).catch(function(){
    res.status(500).send(trans.uploadError + path.join(__dirname,"../../uploads"));
  });
});

module.exports = router;
