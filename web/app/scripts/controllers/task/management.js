'use strict';

/**
 * For job management main page controller
 */
angular.module('ocspApp')
  .controller('TaskManagementCtrl', ['$scope', '$http', 'Notification', '$q', 'usSpinnerService', 'loginService', '$interval', '$uibModal', function ($scope, $http, Notification, $q, usSpinnerService, loginService, $interval, $uibModal) {
    loginService.init('task');
    $scope.selectedJob = {
      input: {},
      events: []
    };
    $scope.actions = [
      {name: "start", enable: true, icon : "glyphicon glyphicon-play success"},
      {name: "stop", enable: true, icon: "glyphicon glyphicon-stop danger"},
      {name: "restart", enable: true, icon: "glyphicon glyphicon-refresh danger"},
      {name: "delete", enable: true, icon: "glyphicon glyphicon-remove-sign warning"}
    ];
    mermaidAPI.initialize({
      startOnLoad:false
    });
    $http.get("/api/prop/spark").success(function(result){
      if(result === null || result === "" || result.value === ""){
        $scope.openSparkModal();
      }
    });
    $scope.openSparkModal = function(){
      var modal = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title-bottom',
        ariaDescribedBy: 'modal-body-bottom',
        templateUrl: 'stackedModal.html',
        size: 'md',
        scope: $scope,
        controller: ['$scope', 'Notification', function($scope, Notification) {
          $scope.inputSpark = function(){
            $http.post("/api/prop/spark", {spark: $scope.spark}).success(function(){
              modal.close();
              $scope.showModal();
            }).error(function(err){
              Notification.error(err);
            });
          };
        }]
      });
    };
    $scope.showModal = function(){
      $scope.$broadcast('openModal',{});
    };

    function dealWith(status) {
      if(status === 0){
        $scope.actions = [
          {name: "start", enable: true, icon : "glyphicon glyphicon-play success"},
          {name: "stop", enable: false, icon: "glyphicon glyphicon-stop"},
          {name: "restart", enable: true, icon: "glyphicon glyphicon-refresh danger"},
          {name: "delete", enable: true, icon: "glyphicon glyphicon-remove-sign warning"}
        ];
      }else if(status === 2){
        $scope.actions = [
          {name: "start", enable: false, icon : "glyphicon glyphicon-play"},
          {name: "stop", enable: true, icon: "glyphicon glyphicon-stop danger"},
          {name: "restart", enable: true, icon: "glyphicon glyphicon-refresh danger"},
          {name: "delete", enable: false, icon: "glyphicon glyphicon-remove-sign"}
        ];
      }else{
        $scope.actions = [
          {name: "start", enable: false, icon : "glyphicon glyphicon-play"},
          {name: "stop", enable: false, icon: "glyphicon glyphicon-stop"},
          {name: "restart", enable: false, icon: "glyphicon glyphicon-refresh"},
          {name: "delete", enable: false, icon: "glyphicon glyphicon-remove-sign"}
        ];
      }
    }

    var timeInterval = $interval(function(){
      if($scope.jobs !== undefined && $scope.jobs.length > 0){
        for(var i in $scope.jobs){
          if($scope.jobs[i].running_time !== undefined) {
            $scope.jobs[i].running_time += 1;
          }
        }
      }
    },1000);

    var taskInterval = $interval(function () {
      $http.get('/api/task/status').success(function(tasks){
        if($scope.jobs !== undefined && $scope.jobs.length > 0){
          for(var i in $scope.jobs){
            for(var j in tasks){
              if($scope.jobs[i].id === tasks[j].id){
                $scope.jobs[i].status = tasks[j].status;
                break;
              }
            }
          }
        }
        if($scope.selectedJob !== undefined && $scope.selectedJob.id !== undefined){
          for(var j in tasks){
            if($scope.selectedJob.id === tasks[j].id){
              $scope.selectedJob.status = tasks[j].status;
              break;
            }
          }
          dealWith($scope.selectedJob.status);
        }
      });
    }, 3000);
    $scope.$on('$destroy', function(){
      if(taskInterval) {
        $interval.cancel(taskInterval);
      }
      if(timeInterval){
        $interval.cancel(timeInterval);
      }
    });
    $scope.links = [];
    $http.get('/api/config/links').success(function(data){
      $scope.links = data;
    });
    function init() {
      // Use for create new task
      $scope.task = {
        input: {},
        events: []
      };
      usSpinnerService.spin('spinner');
      $q.all({job: $http.get('/api/task'), datasource: $http.get('/api/datasource'), labels: $http.get('/api/label')}).then(function(arr){
        $scope.jobs = arr.job.data;
        $scope.datasources = arr.datasource.data;
        $scope.inputLabels = arr.labels.data;
        usSpinnerService.stop('spinner');
      },function(err){
        Notification.error(err.data);
        usSpinnerService.stop('spinner');
      });
    }

    init();

    $scope.update = function(){
      if($scope.selectedJob.id === undefined || $scope.selectedJob.id === null){
        Notification.error("Cannot update null task");
      }else{
        usSpinnerService.spin('spinner');
        $http.put("/api/task", {task: $scope.selectedJob}).success(function(){
          Notification.success("Update task success");
          usSpinnerService.stop('spinner');
        }).error(function(err){
          usSpinnerService.stop('spinner');
          Notification.error(err);
        });
      }
    };

    //Basic functions for page operation
    var parseProperties = function (datainterface, prop){
      if(datainterface.delim === "\\|"){
        datainterface.delim = "|";
      }
      if(prop !== undefined && prop !== null) {
        prop = JSON.parse(prop);
        if(prop.fields !== undefined && prop.fields.length > 0) {
          datainterface.fields = "";
          if (prop.fields.length > 0){
            datainterface.fields = prop.fields[0].pname;
          }
          for (var i = 1; i < prop.fields.length; i++) {
            if(prop.fields[i].pname !== undefined && prop.fields[i].pname !== "") {
              datainterface.fields += "," + prop.fields[i].pname;
            }
          }
        }
        if(prop.props !== undefined && prop.props.length > 0) {
          for (var i in prop.props) {
            if(prop.props[i].pname === "topic"){
              datainterface.topic = prop.props[i].pvalue;
            }
            if(prop.props[i].pname === "codisKeyPrefix"){
              datainterface.codisKeyPrefix = prop.props[i].pvalue;
            }
            else if(prop.props[i].pname === "uniqKeys"){
              datainterface.uniqueKey = prop.props[i].pvalue;
            }
          }
        }
      }
    };

    //TODO: use directive instead
    function drawGraph(item, labels){
      var graphDefinition = 'graph LR;';
      graphDefinition += "task[" + item.name + "];";
      graphDefinition += "input((" + item.input.topic + "));";
      graphDefinition += "task-->|" + item.input.name + "|input;";
      var last = "input";
      if(labels.length > 0) {
        graphDefinition += "subgraph labels;";
        if (labels.length > 1){
          for (var i = 0 ; i < labels.length - 1 ; i++) {
            graphDefinition += labels[i].name + "-->" + labels[i + 1].name + ";";
          }
        }else{
          graphDefinition += labels[0].name + ";";
        }
        graphDefinition += "end;";
        graphDefinition += "input-->" + labels[0].name + ";";
        if (labels.length > 1) {
          last = labels[labels.length - 1].name;
        }else{
          last = labels[0].name;
        }
      }
      if(item.events.length > 0) {
        graphDefinition += "subgraph events;";
        for(var j in item.events){
          if(item.events[j].output === undefined){
            graphDefinition += item.events[j].name + "((\"" + item.events[j].name + "\"));";
          }else {
            if(item.events[j].output.type === 1) {
              graphDefinition += item.events[j].name + "((\"" + item.events[j].name + "(kafka)\"));";
            }else{
              graphDefinition += item.events[j].name + "((\"" + item.events[j].name + "(codis)\"));";
            }
          }
        }
        graphDefinition += "end;";
        for(var j in item.events) {
          graphDefinition += last + "-->" + item.events[j].name + ";";
        }
      }
      var element = document.querySelector("#mermaid");
      element.innerHTML= "";
      var insertSvg = function(svgCode){
        element.innerHTML = svgCode;
      };
      mermaidAPI.render('graphDiv', graphDefinition, insertSvg);
    }

    $scope.changeItem = function(item){
      $scope.selectedJob = item;
      usSpinnerService.spin('spinner');
      $q.all({
        datainterface: $http.get('/api/datainterface/' + item.diid),
        labels: $http.get('/api/label/diid/' + item.diid),
        outputinterface: $http.get('/api/datainterface/output'),
        events: $http.get('/api/event/diid/' + item.diid)})
        .then(function(arr){
          $scope.selectedJob.input = arr.datainterface.data[0];
          $scope.selectedJob.output = arr.outputinterface.data;
          $scope.selectedJob.events = arr.events.data;
          var labels = [];
          //Deal with input properties
          parseProperties($scope.selectedJob.input, $scope.selectedJob.input.properties);
          //Deal with labels
          for (var j in $scope.inputLabels) {
            $scope.inputLabels[j].tick2 = false;
          }
          for (var i in arr.labels.data) {
            for (var j in $scope.inputLabels) {
              if (arr.labels.data[i].label_id === $scope.inputLabels[j].id) {
                $scope.inputLabels[j].tick2 = true;
                labels.push($scope.inputLabels[j]);
              }
            }
          }
          var temp = $scope.inputLabels;
          $scope.inputLabels = [];
          for(var j in labels){
            $scope.inputLabels.push(labels[j]);
          }
          for(var i in temp){
            var flag = true;
            for(var j in labels){
              if(temp[i].id === labels[j].id){
                flag = false;
                break;
              }
            }
            if(flag){
              $scope.inputLabels.push(temp[i]);
            }
          }
          //Deal with events
          for(var i in $scope.selectedJob.events){
            if($scope.selectedJob.events[i].PROPERTIES !== undefined && $scope.selectedJob.events[i].PROPERTIES !== null) {
              $scope.selectedJob.events[i].PROPERTIES = JSON.parse($scope.selectedJob.events[i].PROPERTIES);
              if($scope.selectedJob.events[i].PROPERTIES.props !== undefined && $scope.selectedJob.events[i].PROPERTIES.props.length > 0) {
                for (var j in $scope.selectedJob.events[i].PROPERTIES.props) {
                  if ($scope.selectedJob.events[i].PROPERTIES.props[j].pname === "userKeyIdx") {
                    $scope.selectedJob.events[i].userKeyIdx = $scope.selectedJob.events[i].PROPERTIES.props[j].pvalue;
                  }
                }
              }
              if($scope.selectedJob.events[i].PROPERTIES.output_dis !== undefined && $scope.selectedJob.events[i].PROPERTIES.output_dis[0] !== undefined) {
                $scope.selectedJob.events[i].interval = $scope.selectedJob.events[i].PROPERTIES.output_dis[0].interval;
                $scope.selectedJob.events[i].delim = $scope.selectedJob.events[i].PROPERTIES.output_dis[0].delim;
                if($scope.selectedJob.events[i].delim === "\\|"){
                  $scope.selectedJob.events[i].delim = "|";
                }
                for(var j in $scope.selectedJob.output){
                  if($scope.selectedJob.output[j].id === parseInt($scope.selectedJob.events[i].PROPERTIES.output_dis[0].diid)){
                    $scope.selectedJob.events[i].output = $scope.selectedJob.output[j];
                    parseProperties($scope.selectedJob.events[i].output, $scope.selectedJob.events[i].output.properties);
                    if($scope.selectedJob.events[i].output.dsid === 1){
                      $scope.selectedJob.events[i].output.datasource = $scope.datasources[0];
                    }else{
                      $scope.selectedJob.events[i].output.datasource = $scope.datasources[1];
                    }
                    break;
                  }
                }
              }
            }
          }
          dealWith($scope.selectedJob.status);
          drawGraph($scope.selectedJob, labels);
          usSpinnerService.stop('spinner');
        }, function(err){
          Notification.error(err.data);
          usSpinnerService.stop('spinner');
        });
    };

    $scope.statusName = function(item){
      switch(item){
        case 0: return "glyphicon glyphicon-warning-sign danger"; //stop
        case 1: return "glyphicon glyphicon-ok-sign success animated flash infinite"; // pre_start
        case 2: return "glyphicon glyphicon-ok-sign success"; // running
        case 3: return "glyphicon glyphicon-warning-sign danger animated flash infinite"; // pre_stop
        case 4: return "glyphicon glyphicon-ok-sign success animated flash infinite"; // pre_restart
      }
    };

    $scope.statusText = function(item){
      switch(item) {
        case 0:
          return "Stop";
        case 1:
          return "Pre_start";
        case 2:
          return "Running";
        case 3:
          return "Pre_stop";
        case 4:
          return "Pre_restart";
      }
    };

    $scope.changeStatus = function(item){
      var name = item.name;
      if(!item.enable){
        return;
      }
      var status = 0;
      if(name === "start"){
        status = 1;
      }else if(name === "stop"){
        status = 3;
      }else if(name === "restart"){
        status = 4;
      }else if(name === "delete"){
        if(confirm("Are you sure?")){
          if($scope.selectedJob.id === undefined || $scope.selectedJob.id === null){
            Notification.error("Cannot delete null task");
          }else{
            usSpinnerService.spin('spinner');
            $http.post("/api/task/delete/" + $scope.selectedJob.id, {type: 0}).success(function(){
              $scope.selectedJob.type = 0;
              Notification.success("Delete task success");
              usSpinnerService.stop('spinner');
            }).error(function(err){
              usSpinnerService.stop('spinner');
              Notification.error(err);
            });
          }
        }
        return;
      }
      if($scope.selectedJob.id === undefined || $scope.selectedJob.id === null){
        Notification.error("Cannot update null task");
      }else{
        usSpinnerService.spin('spinner');
        $http.post("/api/task/change/" + $scope.selectedJob.id, {status: status}).success(function(){
          $scope.selectedJob.status = status;
          dealWith(status);
          Notification.success("Update task status success");
          usSpinnerService.stop('spinner');
        }).error(function(err){
          usSpinnerService.stop('spinner');
          Notification.error(err);
        });
      }
    };

    $scope.tab = "summary";
    $scope.changeTab = function(name){
      $scope.tab = name;
    };

    $scope.removeOutput = function($index){
      $scope.task.events.splice($index,1);
    };

    $scope.removeOutput1 = function($index){
      $scope.selectedJob.events.splice($index,1);
    };

    $scope.addOutput = function () {
      $scope.task.events.push({
        output:{}
      });
    };

    $scope.addOutput1 = function () {
      $scope.selectedJob.events.push({
        status: 1,
        output:{}
      });
    };

    $scope.sortLabels = function(arr, index){
      var temp = $scope.inputLabels;
      arr.splice(index, 1);
      $scope.inputLabels = arr;
      for(var i in temp){
        var flag = true;
        for(var j in arr){
          if(temp[i].id === arr[j].id){
            flag = false;
            break;
          }
        }
        if(flag){
          $scope.inputLabels.push(temp[i]);
        }
      }
    };

    $scope.submitMethod = function(){
      var defer = $q.defer();
      usSpinnerService.spin('spinner');
      if(confirm("Save task?")) {
        $http.post("/api/task", {task: $scope.task}).success(function(){
          $scope.task = {
            input: {},
            events: []
          };
          Notification.success("Create task success");
          init();
          defer.resolve();
        }).error(function(err){
          usSpinnerService.stop('spinner');
          Notification.error(err);
          defer.reject();
        });
      }
      return defer.promise;
    };

  }]);
