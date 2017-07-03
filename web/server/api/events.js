"use strict";

import express from 'express';
import sequelize from '../sequelize';
import Sequelize from 'sequelize';
import config from '../config';

let Interface = require('../model/STREAM_DATAINTERFACE')(sequelize, Sequelize);
let Task = require('../model/STREAM_TASK')(sequelize, Sequelize);
let Event_Model = require('../model/STREAM_EVENT')(sequelize, Sequelize);
let randomstring = require("randomstring");

let trans = config[config.trans || 'zh'];
let router = express.Router();
function QueryAllEventInfo(i,AllEventData,AllEventResult,res){
  let EventData = {eventid:"",streamid:"",name:"",select_expr:"",filter_expr:"",p_event_id:"" };
  let tmp_event = AllEventData[i].dataValues;
  EventData.eventid = tmp_event.eventid;
  EventData.name = tmp_event.name;
  EventData.select_expr = tmp_event.select_expr;
  EventData.filter_expr = tmp_event.filter_expr;
  EventData.p_event_id = tmp_event.p_event_id;

  //PROPERTIES要经过计算变成output，不加入EventData
  let PROPERTIES = JSON.parse(tmp_event.PROPERTIES);
  let output_dis = PROPERTIES.output_dis[0];
  let props = PROPERTIES.props;
  //promise
  let promises = [];

  let interval = output_dis.interval;
  let datainterface_id = output_dis.diid;
  let delim = output_dis.delim;

  let datasource_id = '';
  let topic ='';
  let prefix = '';
  let streamid = '';

  let subscribe = '';
  for (let i in props){
    if (props[i].pname === 'period'){
      subscribe = props[i].pvalue;
    }
  }
  //将查询task表与datainterface表装进promises
  promises.push(Interface.find({attributes: [['dsid','datasource_id'], 'properties'], where: {id: datainterface_id}}).then((data) =>
  {
    let tmp_interface = data.dataValues;
    datasource_id = tmp_interface.datasource_id;
    let properties = JSON.parse(tmp_interface.properties);
    //判断datasource类型,若为kafka则将名字赋给topic,若为codis则赋给prefix
    if (datasource_id === 1) {
      topic = properties.props[0].pvalue;
    }
    if (datasource_id === 2) {
      prefix = properties.props[0].pvalue;
    }
  }));
  promises.push(Task.find({attributes: [['id', 'streamid']], where: {diid: AllEventData[i].diid}}).then((data) =>
  {
    streamid = data.dataValues.streamid;
  }));
  sequelize.Promise.all(promises).then(()=>{
    let output = {
      "datainterface_id": datainterface_id,
      "datasource_id": datasource_id,
      "topic": topic,
      "prefix": prefix,
      "interval": interval,
      "delim": delim,
      "subscribe": subscribe
    };

    EventData.streamid = streamid;
    EventData.output = output;
    EventData.status = tmp_event.status;
    EventData.description = tmp_event.description;
    AllEventResult.events.push(EventData);

    if (parseInt(i) === (AllEventData.length-1)){
      res.status(200).send(AllEventResult);
    }
  },() => {
    res.status(500).send(trans.databaseError);
  });
}
router.delete('/:id', function(req, res){
  Event_Model.destroy({
    where:{
      id : req.params.id
    }
  }).then(function (){
    res.status(204).send({success:true});
  }, function(){
    res.status(500).send(trans.databaseError);
  });
});

router.post('/', function(req, res) {
  let streamid = req.body.streamid;
  let name = req.body.name;
  let select_expr = req.body.select_expr;
  let filter_expr = req.body.filter_expr;
  let p_event_id = req.body.p_event_id;
  let status = req.body.status;
  let diid;
  let output = req.body.output;
  let subscribe = output.subscribe;
  let PROPERTIES = {"props": [{"pname": "userKeyIdx", "pvalue": 2}], "output_dis": []};
  let new_event = {};
  sequelize.transaction(function (t) {
    //先根据streamid查询对应输入源的diid
    return Task.find({attributes: ['diid'], where: {id: streamid}}, {transaction: t}).then((data) => {
      diid = data.dataValues.diid;
      let properties = {
        props: [{"pname": "", "pvalue": ""}, {"pname": "uniqKeys", "pvalue": "imsi"}],
        "userFields": [],
        "fields": []
      };
      if (output.datasource_id === 1) {
        properties.props[0].pname = "topic";
        properties.props[0].pvalue = output.topic;
      }else if (output.datasource_id === 2) {
        properties.props[0].pname = "prefix";
        properties.props[0].pvalue = output.prefix;
      }
      let datainterface = {
        "name": name + "_" + randomstring.generate(10),
        "type": 1,
        "dsid": output.datasource_id,
        "filter_expr": '',
        "description": '',
        "delim": output.delim,
        "status": 1,
        "properties": JSON.stringify(properties)
      };
      //先插入一个新的输出的datainterface
      return Interface.create(datainterface, {transaction: t}).then((data) => {
        //拿到新插入的datainterface的id作为event的输出diid
        let output_diid = data.dataValues.id;
        if (output.subscribe !== undefined && output.subscribe !== null){
          PROPERTIES.props.push({"pname":"period","pvalue":JSON.stringify(subscribe)});
        }
        PROPERTIES.output_dis[0] = {"diid":output_diid,"interval":output.interval,"delim":output.delim};
        new_event = {
          "name": name,
          "select_expr": select_expr,
          "filter_expr": filter_expr,
          "p_event_id": p_event_id,
          "diid": diid,
          "status": status,
          "PROPERTIES": JSON.stringify(PROPERTIES)
        };
        //插入一个新的event
        return Event_Model.create(new_event, {transaction: t});
      });
    });
  }).then((data)=> {
    res.status(201).send({success: true,"event_id":data.dataValues.id});
  }, function () {
    res.status(500).send(trans.databaseError);
  }).catch(function () {
    res.status(500).send(trans.databaseError);
  });
});

router.put('/:id', function(req, res) {
  let new_event = {};
  if (req.body.name !== null && req.body.name !== undefined){
    new_event.name = req.body.name;
  }
  if (req.body.select_expr !== null && req.body.select_expr !== undefined){
    new_event.select_expr = req.body.select_expr;
  }
  if (req.body.filter_expr !== null && req.body.filter_expr !== undefined){
    new_event.filter_expr = req.body.filter_expr;
  }
  if (req.body.p_event_id !== null && req.body.p_event_id !== undefined){
    new_event.p_event_id = req.body.p_event_id;
  }
  if (req.body.status !== null && req.body.status !== undefined){
    new_event.status = req.body.status;
  }
  if (req.body.description !== null && req.body.description !== undefined){
    new_event.description = req.body.description;
  }
  let output;
  if (req.body.output !== null && req.body.output !== undefined){
    output = req.body.output;
    let PROPERTIES = {"props": [{"pname": "userKeyIdx", "pvalue": 2}], "output_dis": []};
    if (output.subscribe !== undefined && output.subscribe !== null){
      PROPERTIES.props.push({"pname":"period","pvalue":JSON.stringify(output.subscribe)});
    }
    PROPERTIES.output_dis[0] = {"diid":output.datainterface_id,"interval":output.interval,"delim":output.delim};
    new_event.PROPERTIES = JSON.stringify(PROPERTIES);
  }
  if (req.body.streamid !== null && req.body.streamid !== undefined) {
    Task.find({attributes: ['diid'], where: {id: req.body.streamid}}).then((data) => {
      new_event.diid = data.dataValues.diid;
      Event_Model.update(new_event, {where: {id: req.params.id}}).then(function () {
        res.status(202).send({success: true});
      }, function () {
        res.status(500).send(trans.databaseError);
      });
    });
  }
  else {
    Event_Model.update(new_event, {where: {id: req.params.id}}).then(function () {
      res.status(202).send({success: true});
    }, function () {
      res.status(500).send(trans.databaseError);
    });
  }
});

//获取所有事件信息
router.get('/', function(req, res) {
  let page_size = parseInt(req.query.page_size);
  let page = parseInt(req.query.page);
  if (isNaN(page_size)){
    page_size = 15;
  }
  if (isNaN(page)){
    page = 1;
  }
  let limit = page_size;
  let offset = (page-1)*page_size;
  Event_Model.findAll({
         attributes: [['id', 'eventid'], 'diid', 'name', 'select_expr', 'filter_expr', 'p_event_id', 'PROPERTIES', 'status', 'description'],
         limit: limit,
         offset: offset
  }).then((AllEventData) => {
         let AllEventResult = {"pageSize":"","totalPageNumber":"","currentPage":"","events":[]};
             AllEventResult.pageSize = page_size;
             AllEventResult.currentPage = page;
             AllEventResult.totalPageNumber = Math.ceil(AllEventData.length/page_size);
         if (AllEventData.length !== 0){
            for (let i in AllEventData){
                //以下上是直接输出的字段EventData
                //  let EventData;
                QueryAllEventInfo(i,AllEventData,AllEventResult,res);

                }
        }else{
        res.status(500).send(trans.databaseError);
        }
        }).catch( function () {
        res.status(500).send(trans.databaseError);
        });
  });

//根据事件id获取事件信息
router.get('/:id', function(req, res) {
  Event_Model.find({
    attributes: [['id', 'eventid'], 'diid', 'name', 'select_expr', 'filter_expr', 'p_event_id', 'PROPERTIES', 'status', 'description'],
    where:{
      id: req.params.id
    }
  }).then((Event) => {
               let tmp_event = Event.dataValues;
               let eventid = tmp_event.eventid;
               let name = tmp_event.name;
               let select_expr = tmp_event.select_expr;
               let filter_expr = tmp_event.filter_expr;
               let p_event_id = tmp_event.p_event_id;
               let status = tmp_event.status;
               let description = tmp_event.description;
               let PROPERTIES = JSON.parse(tmp_event.PROPERTIES);
               let output_dis = PROPERTIES.output_dis[0];
               let props = PROPERTIES.props;
               let subscribe = '';
               for (let i in props){
                  if (props[i].pname === 'period'){
                     subscribe = props[i].pvalue;
                  }
               }
               let interval = output_dis.interval;
               let datainterface_id = output_dis.diid;
               let delim = output_dis.delim;
               let datasource_id = '';
               let topic ='';
               let prefix = '';
               let streamid = '';
               //将查询task表与datainterface表装进promises
               let promises = [];
               promises.push(Interface.find({attributes: [['dsid','datasource_id'], 'properties'], where: {id: datainterface_id}}).then((data) =>
               {
                    let tmp_interface = data.dataValues;
                    datasource_id = tmp_interface.datasource_id;
                    let properties = JSON.parse(tmp_interface.properties);
                    //判断datasource类型,若为kafka则将名字赋给topic,若为codis则赋给prefix
                    if (datasource_id === 1) {
                       topic = properties.props[0].pvalue;
                    }
                    if (datasource_id === 2) {
                       prefix = properties.props[0].pvalue;
                    }
                    }));
               promises.push(Task.find({attributes: [['id', 'streamid']], where: {diid: Event.diid}}).then((data) =>
               {
                   streamid = data.dataValues.streamid;
               }));
               sequelize.Promise.all(promises).then(()=>{
                   let output = {
                      "datainterface_id": datainterface_id,
                      "datasource_id": datasource_id,
                      "topic": topic,
                      "prefix": prefix,
                      "interval": interval,
                      "delim": delim,
                      "subscribe": subscribe
                   };
                   res.status(200).send({
                       eventid,
                       streamid,
                       name,
                       select_expr,
                       filter_expr,
                       p_event_id,
                       output,
                       status,
                       description
                   });
               });
  },()=>{ res.status(500).send(trans.databaseError); }
  ).catch( function () {
          res.status(500).send(trans.databaseError);
        });
});


module.exports = router;
