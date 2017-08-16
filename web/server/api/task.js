"use strict";
let express = require('express');
let sequelize = require('../sequelize');
let Sequelize = require('sequelize');
let Task = require('../model/STREAM_TASK')(sequelize, Sequelize);
let Interface = require('../model/STREAM_DATAINTERFACE')(sequelize, Sequelize);
let Label = require('../model/STREAM_LABEL')(sequelize, Sequelize);
let EventDef = require('../model/STREAM_EVENT')(sequelize, Sequelize);
let randomstring = require("randomstring");
let config = require('../config');
let trans = config[config.trans || 'zh'];
let moment = require('moment');

let router = express.Router();

let _getRunningTime = function (tasks) {
  if (tasks !== undefined && tasks.length > 0) {
    let date = new Date();
    let sss = date.getTime();
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].dataValues !== undefined && tasks[i].dataValues.start_time !== undefined &&
        tasks[i].dataValues.start_time !== null && tasks[i].dataValues.start_time !== "") {
        if (tasks[i].status === 2) {
          tasks[i].dataValues.running_time = parseInt(sss - tasks[i].dataValues.start_time);
        } else if (tasks[i].status === 0 && tasks[i].dataValues.stop_time !== undefined &&
          tasks[i].dataValues.stop_time !== null &&
          tasks[i].dataValues.stop_time !== "") {
          tasks[i].dataValues.running_time = parseInt(tasks[i].dataValues.stop_time - tasks[i].dataValues.start_time);
        } else {
          tasks[i].dataValues.running_time = null;
        }
      }
    }
  }
};

router.get('/', function (req, res) {
  let username = req.query.username;
  let usertype = req.query.usertype;
  if (usertype === "admin") {
    Task.findAll().then((tasks) => {
      _getRunningTime(tasks);
      res.send(tasks);
    }).catch(function (err) {
      console.error(err);
      res.status(500).send(trans.databaseError);
    });
  } else {
    Task.findAll({ where: { owner: username } }).then((tasks) => {
      _getRunningTime(tasks);
      res.send(tasks);
    }).catch(function (err) {
      console.error(err);
      res.status(500).send(trans.databaseError);
    });
  }
});

router.get('/status', function (req, res) {
  let username = req.query.username;
  let usertype = req.query.usertype;
  if (usertype === "admin") {
    Task.findAll({ attributes: ['id', 'status', 'start_time', 'stop_time'] }).then(function (tasks) {
      _getRunningTime(tasks);
      res.send(tasks);
    }).catch(function (err) {
      console.error(err);
      res.status(500).send(trans.databaseError);
    });
  } else {
    Task.findAll({ attributes: ['id', 'status', 'start_time', 'stop_time'], where: { owner: username } }).then(function (tasks) {
      _getRunningTime(tasks);
      res.send(tasks);
    }).catch(function (err) {
      console.error(err);
      res.status(500).send(trans.databaseError);
    });
  }
});

router.post('/change/:id', function (req, res) {
  let status = req.body.status;
  let username = req.query.username;
  let usertype = req.query.usertype;
  sequelize.transaction(function (t) {
    return Task.find({ where: { id: req.params.id }, transaction: t }).then(function (task) {
      let result = task.dataValues;
      if (result.status === 0 && status === 4) {// When task is in stop status, it cannot be restart.
        return sequelize.Promise.reject();
      }
      if (result.owner !== username || usertype === "admin") {
        return sequelize.Promise.reject();// Only owner can change status
      }
      if (status === "delete") {
        result.type = 0;
      } else {
        result.status = status;
      }
      return Task.update(result, { where: { id: req.params.id }, transaction: t });
    });
  }).then(function () {
    res.send({ success: true });
  }).catch(function (err) {
    console.error(err);
    res.status(500).send(trans.databaseError);
  });
});

function dealDataInterfaceProperties(dataInterface, dsid, type) {
  dataInterface.dsid = dsid;
  dataInterface.type = type;
  dataInterface.status = 1;
  if(dataInterface.userFields === undefined || dataInterface.userFields === null){
    dataInterface.userFields = [];
  }
  dataInterface.properties = { "props": [], "userFields": dataInterface.userFields, "fields": [] };
  if (dataInterface.delim !== undefined && dataInterface.delim === "|") {
    dataInterface.delim = "\\|";
  }
  if (dataInterface.delim === undefined) {
    dataInterface.delim = "";
  }
  let _parseFields = function (properties, fields, name) {
    if (fields === undefined) {
      return [];
    }
    fields = fields.replace(/\s/g, '');
    let splits = fields.split(",");
    for (let i in splits) {
      if (splits[i] !== undefined && splits[i] !== "") {
        properties[name].push({
          "pname": splits[i].trim(),
          "ptype": "String"
        });
      }
    }
    return splits;
  };
  if (dataInterface.fields !== undefined && dataInterface.fields !== "") {
    dataInterface.properties.props.push({
      "pname": "field.numbers",
      "pvalue": _parseFields(dataInterface.properties, dataInterface.fields, "fields").length
    });
  }
  if (dataInterface.topic !== undefined) {
    dataInterface.properties.props.push({
      "pname": "topic",
      "pvalue": dataInterface.topic
    });
  }
  if (dataInterface.uniqueKey !== undefined) {
    dataInterface.properties.props.push({
      "pname": "uniqKeys",
      "pvalue": dataInterface.uniqueKey
    });
  }
  if (dataInterface.codisKeyPrefix !== undefined) {
    dataInterface.properties.props.push({
      "pname": "codisKeyPrefix",
      "pvalue": dataInterface.codisKeyPrefix
    });
  }
  if (dataInterface.inputs !== undefined && dataInterface.inputs.length > 0) {
    dataInterface.properties.sources = [];
    for (let i in dataInterface.inputs) {
      if (dataInterface.inputs[i].delim !== undefined && dataInterface.inputs[i].delim === "|") {
        dataInterface.inputs[i].delim = "\\|";
      }
      if (dataInterface.inputs[i].delim === undefined) {
        dataInterface.inputs[i].delim = "";
      }
      let result = {
        "pname": dataInterface.inputs[i].name,
        "delim": dataInterface.inputs[i].delim,
        "topic": dataInterface.inputs[i].topic,
        "userFields": [],
        "fields": []
      };
      _parseFields(result, dataInterface.inputs[i].fields, "fields");
      if (dataInterface.inputs[i].userFields !== undefined && dataInterface.inputs[i].userFields.length > 0) {
        for (let j in dataInterface.inputs[i].userFields) {
          result.userFields.push({
            "pname": dataInterface.inputs[i].userFields[j].name,
            "pvalue": dataInterface.inputs[i].userFields[j].value,
            "undefined": "on"
          });
        }
      }
      dataInterface.properties.sources.push(result);
    }
  }
  dataInterface.properties = JSON.stringify(dataInterface.properties);
}

function createLabel(labels, di, t, promises, value) {
  if (value === undefined || isNaN(value) || value === null) {
    value = 0;
  }
  for (let i in labels) {
    labels[i].label_id = labels[i].id;
    labels[i].id = parseInt(value) + parseInt(i) + 1;
    labels[i].diid = di.id;
    labels[i].status = 1;
    if (parseInt(i) !== 0) {
      labels[i].p_label_id = parseInt(value) + parseInt(i);
    }
    promises.push(Label.create(labels[i], { transaction: t }));
  }
}

function createEvents(events, i, diid, status) {
  events[i].p_event_id = parseInt(i);
  //Only events contains PROPERTIES instead pf properties
  events[i].PROPERTIES = { "props": [], "output_dis": [] };
  events[i].diid = diid;
  events[i].status = status;
  if (events[i].select_expr !== undefined && events[i].select_expr !== "") {
    events[i].select_expr = events[i].select_expr.replace(/\s/g, '');
  }
  if (events[i].delim === undefined) {
    events[i].delim = "";
  }
  events[i].PROPERTIES.props.push({
    "pname": "userKeyIdx",
    "pvalue": 2
  });
  if (events[i].output !== undefined && events[i].output.id !== undefined) {
    events[i].PROPERTIES.output_dis.push({
      "diid": events[i].output.id,
      "interval": events[i].interval,
      "delim": events[i].delim
    });
  }
  //Add data audit function
  if (events[i].audit !== undefined) {
    let result = {
      period: events[i].audit.type,
      time: []
    };
    if (events[i].audit.enableDate === 'have' && events[i].audit.startDate && events[i].audit.endDate) {
      result.startDate = moment(events[i].audit.startDate).format("YYYY-MM-DD");
      result.endDate = moment(events[i].audit.endDate).format("YYYY-MM-DD");
    }
    if (events[i].audit.type && events[i].audit.type !== "always" && events[i].audit.periods && events[i].audit.periods.length > 0) {
      for (let j = 0; j < events[i].audit.periods.length; j++) {
        let sd = "0";
        let ed = "0";
        if (events[i].audit.type === 'week' || events[i].audit.type === 'month') {
          sd = events[i].audit.periods[j].s;
          ed = events[i].audit.periods[j].d;
        }
        let sh = moment(events[i].audit.periods[j].start).format("HH:mm:ss");
        let eh = moment(events[i].audit.periods[j].end).format("HH:mm:ss");
        result.time.push({
          begin: {
            d: sd,
            h: sh
          },
          end: {
            d: ed,
            h: eh
          }
        });
      }
    }
    events[i].PROPERTIES.props.push({
      "pname": "period",
      "pvalue": JSON.stringify(result)
    });
  }
  events[i].PROPERTIES = JSON.stringify(events[i].PROPERTIES);
}

function createOrUpdateOutputDataInterface(events, t, promises) {
  let promise = null;
  for (let i in events) {
    events[i].output.name = events[i].name + "_" + randomstring.generate(10);
    if (events[i].output.datasource !== undefined && events[i].output.datasource.id !== undefined) {
      dealDataInterfaceProperties(events[i].output, events[i].output.datasource.id, 1);
    } else {
      dealDataInterfaceProperties(events[i].output, null, 1);
    }
    if (events[i].output.id === undefined || events[i].output.id === null) {
      promise = Interface.create(events[i].output, { transaction: t });
    } else {
      promise = Interface.update(events[i].output, { where: { id: events[i].output.id }, transaction: t });
    }
    promises.push(promise);
  }
}

router.post("/", function (req, res) {
  let labels = req.body.task.outputLabels;
  let task = req.body.task;
  let inputInterface = req.body.task.input;
  let events = req.body.task.events;
  let usertype = req.query.usertype;
  if (usertype === "admin") {
    //admin cannot create tasks
    res.status(500).send(trans.authError);
  } else {
    // create input data interface
    sequelize.transaction(function (t) {
      if (inputInterface.datasource !== undefined && inputInterface.datasource.id !== undefined) {
        dealDataInterfaceProperties(inputInterface, inputInterface.datasource.id, 0);
      } else {
        dealDataInterfaceProperties(inputInterface, null, 0);
      }
      inputInterface.name = task.name + "_" + randomstring.generate(10);
      return sequelize.Promise.all([
        Interface.create(inputInterface, { transaction: t }),
        Label.max("id", { transaction: t })]).then(function (di) {
          let promises = [];
          // create outputs
          createOrUpdateOutputDataInterface(events, t, promises);
          // create labels
          createLabel(labels, di[0], t, promises, di[1]);
          // create task
          task.diid = di[0].id;
          task.type = 1;
          task.status = 0;
          task.queue = "default";
          task.owner = req.query.username;
          promises.push(Task.create(task, { transaction: t }));
          return sequelize.Promise.all(promises).then(function (result) {
            let eventPromises = [];
            for (let i in events) {
              events[i].output.id = result[i].dataValues.id;
              events[i].owner = req.query.username;
              createEvents(events, i, task.diid, 1);
              eventPromises.push(EventDef.create(events[i], { transaction: t }));
            }
            return sequelize.Promise.all(eventPromises);
          });
        });
    }).then(function () {
      res.send({ success: true });
    }).catch(function (err) {
      console.error(err);
      res.status(500).send(trans.databaseError);
    });
  }
});

let mergeDBProps = function (targetProps, dbProps) {

  let isPNameExists = function (propslist, pname) {
    for (let i in propslist) {
      if (propslist[i].pname === pname) {
        return true;
      }
    }
    return false;
  };

  for (let i in dbProps.props) {
    if (!isPNameExists(targetProps.props, dbProps.props[i].pname)) {
      targetProps.props.push(dbProps.props[i]);
    }
  }

  return targetProps;
};

router.put("/", function (req, res) {
  let task = req.body.task;
  let inputInterface = req.body.task.input;
  let labels = req.body.task.labels;
  let events = req.body.task.events;
  let eventIDs = [];
  for (let i in events) {
    eventIDs.push(events[i].id);
  }
  EventDef.findAll({ attributes: ["id", "PROPERTIES"], where: { id: { $in: eventIDs } } }).then((eventsDataFromDB) => {

    Task.find({ attributes: ["owner"], where: { id: task.id } }).then((owner) => {
      if (owner && owner.dataValues && owner.dataValues.owner === req.query.username) {
        return sequelize.transaction(function (t) {
          let promises = [];
          promises.push(Label.max("id", { transaction: t }));
          promises.push(EventDef.findAll({ where: { diid: inputInterface.id }, transaction: t }));
          if (inputInterface.datasource !== undefined && inputInterface.datasource.id !== undefined) {
            dealDataInterfaceProperties(inputInterface, inputInterface.datasource.id, 0);
          } else {
            dealDataInterfaceProperties(inputInterface, null, 0);
          }
          promises.push(Interface.update(inputInterface, { where: { id: inputInterface.id }, transaction: t }));
          promises.push(Task.update(task, { where: { id: task.id }, transaction: t }));
          promises.push(Label.destroy({ where: { diid: inputInterface.id }, transaction: t }));
          createOrUpdateOutputDataInterface(events, t, promises);
          return sequelize.Promise.all(promises).then(function (result) {
            let promises1 = [];
            //create label after delete
            createLabel(labels, inputInterface, t, promises1, result[0]);
            //create or update events
            for (let i = 0; i < events.length; i++) {
              if (result[i + 5].dataValues !== undefined && result[i + 5].dataValues.id !== undefined) {
                events[i].output.id = result[i + 5].dataValues.id;
              }
              createEvents(events, i, inputInterface.id, events[i].status ? 1 : 0);
              if (events[i].id === undefined || events[i].id === null) {
                promises1.push(EventDef.create(events[i], { transaction: t }));
              } else {
                for(let _idx in eventsDataFromDB){
                  if(events[i].id === eventsDataFromDB[_idx].dataValues.id){
                    events[i].PROPERTIES = JSON.stringify(mergeDBProps(JSON.parse(events[i].PROPERTIES),JSON.parse(eventsDataFromDB[_idx].dataValues.PROPERTIES)));
                  }
                }
                promises1.push(EventDef.update(events[i], { where: { id: events[i].id }, transaction: t }));
              }
            }
            //deleted unused events
            for (let i in result[1]) {
              if (result[1][i].dataValues !== undefined && result[1][i].dataValues.id !== undefined) {
                let flag = true;
                for (let j in events) {
                  if (events[j].id !== undefined && result[1][i].dataValues.id === events[j].id) {
                    flag = false;
                    break;
                  }
                }
                if (flag) {
                  promises1.push(EventDef.destroy({ where: { id: result[1][i].dataValues.id }, transaction: t }));
                  if (result[1][i].dataValues.PROPERTIES !== undefined) {
                    let obj = JSON.parse(result[1][i].dataValues.PROPERTIES);
                    if (obj.output_dis !== undefined && obj.output_dis[0] !== undefined && obj.output_dis[0].diid !== undefined) {
                      promises1.push(Interface.destroy({ where: { id: obj.output_dis[0].diid }, transaction: t }));
                    }
                  }
                }
              }
            }
            return sequelize.Promise.all(promises1);
          });
        }).then(function () {
          res.send({ success: true });
        });
      } else {
        console.error("Only stream owner can change stream properties");
        res.status(500).send(trans.authError);
      }
    }).catch(function (err) {
      console.error(err);
      res.status(500).send(trans.databaseError);
    });

  });

});

module.exports = router;
