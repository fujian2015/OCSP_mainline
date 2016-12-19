var express = require('express');
var sequelize = require('../sequelize');
var Sequelize = require('sequelize');
var Task = require('../model/STREAM_TASK')(sequelize, Sequelize);
var Interface = require('../model/STREAM_DATAINTERFACE')(sequelize, Sequelize);
var Label = require('../model/STREAM_LABEL')(sequelize, Sequelize);
var Event = require('../model/STREAM_EVENT')(sequelize, Sequelize);
var randomstring = require("randomstring");
var config = require('../config');
var trans = config[config.trans || 'zh'];

var router = express.Router();

var getRunningTime = function (tasks) {
  if (tasks !== undefined && tasks.length > 0) {
    var date = new Date();
    var sss = date.getTime();
    for (var i = 0; i < tasks.length; i++) {
      if(tasks[i].dataValues !== undefined && tasks[i].dataValues.start_time !== undefined && tasks[i].dataValues.start_time != null && tasks[i].dataValues.start_time != "") {
        tasks[i].dataValues.running_time = parseInt((sss - tasks[i].dataValues.start_time)/ 1000);
      }
    }
  }
};

router.get('/', function(req, res){
  Task.findAll().then(function (tasks){
    getRunningTime(tasks);
    res.send(tasks);
  }, function(){
    res.status(500).send(trans.databaseError);
  });
});

router.get('/status', function(req,res){
  Task.findAll({attributes: ['id','status']}).then(function (tasks){
    res.send(tasks);
  }, function(){
    res.status(500).send(trans.databaseError);
  });
});

router.post('/change/:id', function(req, res){
  var status = req.body.status;
  sequelize.transaction(function(t) {
    return Task.find({where: {id: req.params.id}, transaction: t}).then(function (task) {
      var result = task.dataValues;
      result.status = status;
      return Task.update(result, {where: {id: req.params.id}, transaction: t});
    });
  }).then(function(){
    res.send({success: true});
  },function(){
    res.status(500).send(trans.databaseError);
  }).catch(function () {
    res.status(500).send(trans.databaseError);
  });
});

router.post('/delete/:id', function(req, res){
  var type = req.body.type;
  sequelize.transaction(function(t) {
    return Task.find({where: {id: req.params.id}, transaction: t}).then(function (task) {
      var result = task.dataValues;
      result.type = type;
      return Task.update(result, {where: {id: req.params.id}, transaction: t});
    });
  }).then(function(){
    res.send({success: true});
  },function(){
    res.status(500).send(trans.databaseError);
  }).catch(function () {
    res.status(500).send(trans.databaseError);
  });
});



function dealDataInterfaceProperties(dataInterface, dsid, type) {
  dataInterface.dsid = dsid;
  dataInterface.type = type;
  dataInterface.status = 1;
  dataInterface.properties = {"props": [], "userFields": [], "fields": []};
  if(dataInterface.delim !== undefined && dataInterface.delim === "|"){
    dataInterface.delim = "\\|";
  }
  if(dataInterface.delim === undefined){
    dataInterface.delim = "";
  }
  if (dataInterface.fields !== undefined && dataInterface.fields !== ""){
    dataInterface.fields = dataInterface.fields.replace(/\s/g, '');
    var splits = dataInterface.fields.split(",");
    for(var i in splits){
      if(splits[i] !== undefined && splits[i] !== "") {
        dataInterface.properties.fields.push({
          "pname": splits[i],
          "ptype": "String"
        });
      }
    }
    dataInterface.properties.props.push({
      "pname" : "field.numbers",
      "pvalue" : splits.length
    });
  }
  if (dataInterface.topic !== undefined){
    dataInterface.properties.props.push({
      "pname" : "topic",
      "pvalue" : dataInterface.topic
    });
  }
  if (dataInterface.uniqueKey !== undefined){
    dataInterface.properties.props.push({
      "pname" : "uniqKeys",
      "pvalue" : dataInterface.uniqueKey
    });
  }
  if (dataInterface.codisKeyPrefix !== undefined){
    dataInterface.properties.props.push({
      "pname" : "codisKeyPrefix",
      "pvalue" : dataInterface.codisKeyPrefix
    });
  }
  dataInterface.properties = JSON.stringify(dataInterface.properties);
}

function createLabel(labels, di, t, promises, value) {
  if(value === undefined || isNaN(value) || value === null){
    value = 0;
  }
  for(var i in labels) {
    labels[i].label_id = labels[i].id;
    labels[i].id = parseInt(value) + parseInt(i) + 1;
    labels[i].diid = di.id;
    labels[i].status = 1;
    if (parseInt(i) !== 0) {
      labels[i].p_label_id = parseInt(value) + parseInt(i);
    }
    promises.push(Label.create(labels[i], {transaction: t}));
  }
}

function createEvents(events, i, diid, status) {
  events[i].p_event_id = parseInt(i);
  //Only events contains PROPERTIES instead pf properties
  events[i].PROPERTIES = {"props": [], "output_dis": []};
  events[i].diid = diid;
  events[i].status = status;
  if(events[i].select_expr !== undefined && events[i].select_expr !== "") {
    events[i].select_expr = events[i].select_expr.replace(/\s/g, '');
  }
  if(events[i].delim !== undefined && events[i].delim === "|"){
    events[i].delim = "\\|";
  }
  if(events[i].delim === undefined){
    events[i].delim = "";
  }
  events[i].PROPERTIES.props.push({
    "pname" : "userKeyIdx",
    "pvalue" : 2
  });
  if(events[i].output !== undefined && events[i].output.id !== undefined) {
    events[i].PROPERTIES.output_dis.push({
      "diid": events[i].output.id,
      "interval" : events[i].interval,
      "delim": events[i].delim
    });
  }
  events[i].PROPERTIES = JSON.stringify(events[i].PROPERTIES);
}

function createOrUpdateOutputDataInterface(events, t, promises) {
  var promise = null;
  for(var i in events){
    events[i].output.name = events[i].name + "_" + randomstring.generate(10);
    if(events[i].output.datasource !== undefined && events[i].output.datasource.id !== undefined){
      dealDataInterfaceProperties(events[i].output, events[i].output.datasource.id, 1);
    }else{
      dealDataInterfaceProperties(events[i].output, null, 1);
    }
    if(events[i].output.id === undefined || events[i].output.id === null) {
      promise = Interface.create(events[i].output, {transaction: t});
    }else{
      promise = Interface.update(events[i].output, {where: {id : events[i].output.id}, transaction: t});
    }
    promises.push(promise);
  }
}

router.post("/", function(req, res){
  var labels = req.body.task.outputLabels;
  var task = req.body.task;
  var inputInterface = req.body.task.input;
  var events = req.body.task.events;
  // create input data interface
  sequelize.transaction(function(t) {
    //Input datasource is kafka by default
    dealDataInterfaceProperties(inputInterface, 1, 0);
    return sequelize.Promise.all([
      Interface.create(inputInterface, {transaction: t}),
      Label.max("id", {transaction: t})]).then(function (di) {
      var promises = [];
      // create outputs
      createOrUpdateOutputDataInterface(events, t, promises);
      // create labels
      createLabel(labels, di[0], t, promises, di[1]);
      // create task
      task.diid = di[0].id;
      task.type = 1;
      task.status = 1;
      task.queue = "default";
      promises.push(Task.create(task, {transaction: t}));
      return sequelize.Promise.all(promises).then(function (result) {
        var eventPromises = [];
        for (var i in events) {
          events[i].output.id = result[i].dataValues.id;
          createEvents(events, i, task.diid, 1);
          eventPromises.push(Event.create(events[i], {transaction: t}));
        }
        return sequelize.Promise.all(eventPromises);
      });
    });
  }).then(function(){
    res.send({success: true});
  },function(){
    res.status(500).send(trans.databaseError + trans.inputDuplicateKey);
  }).catch(function () {
    res.status(500).send(trans.databaseError);
  });
});

router.put("/", function(req, res) {
  var task = req.body.task;
  var inputInterface = req.body.task.input;
  var labels = req.body.task.labels;
  var events = req.body.task.events;
  sequelize.transaction(function(t) {
    var promises = [];
    promises.push(Label.max("id", {transaction: t}));
    promises.push(Event.findAll({where:{diid : inputInterface.id}, transaction: t}));
    dealDataInterfaceProperties(inputInterface, 1, 0);
    promises.push(Interface.update(inputInterface, {where: {id : inputInterface.id}, transaction: t}));
    promises.push(Task.update(task, {where: {id: task.id}, transaction: t}));
    promises.push(Label.destroy({where: {diid: inputInterface.id}, transaction: t}));
    createOrUpdateOutputDataInterface(events, t, promises);
    return sequelize.Promise.all(promises).then(function (result) {
      var promises1 = [];
      //create label after delete
      createLabel(labels, inputInterface, t, promises1, result[0]);
      //create or update events
      for (var i = 0 ; i < events.length; i++) {
        if(result[i+5].dataValues !== undefined && result[i+5].dataValues.id !== undefined){
          events[i].output.id = result[i+5].dataValues.id;
        }
        createEvents(events, i, inputInterface.id, events[i].status?1:0);
        if(events[i].id === undefined || events[i].id === null){
          promises1.push(Event.create(events[i], {transaction: t}));
        }else {
          promises1.push(Event.update(events[i], {where: {id: events[i].id}, transaction: t}));
        }
      }
      //deleted unused events
      for(var i in result[1]){
        if(result[1][i].dataValues !== undefined && result[1][i].dataValues.id !== undefined){
          var flag = true;
          for(var j in events){
            if(events[j].id !== undefined && result[1][i].dataValues.id === events[j].id){
              flag = false;
              break;
            }
          }
          if(flag){
            promises1.push(Event.destroy({where: {id: result[1][i].dataValues.id}, transaction: t}));
            if(result[1][i].dataValues.PROPERTIES !== undefined){
              var obj = JSON.parse(result[1][i].dataValues.PROPERTIES);
              if(obj.output_dis !== undefined && obj.output_dis[0] !== undefined && obj.output_dis[0].diid !== undefined) {
                promises1.push(Interface.destroy({where: {id: obj.output_dis[0].diid}, transaction: t}))
              }
            }
          }
        }
      }
      return sequelize.Promise.all(promises1);
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
