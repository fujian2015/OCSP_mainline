'use strict';

/**
 * For job management main page controller
 */
angular.module('ocspApp')
  .controller('TaskManagementCtrl', ['$scope', '$http', 'Notification', '$q', '$rootScope', '$interval', '$uibModal', '$filter', 'moment', 'strService', 'CONFIGS', '$ngConfirm',
    function ($scope, $http, Notification, $q, $rootScope, $interval, $uibModal, $filter, moment, strService, CONFIGS, $ngConfirm) {
    $rootScope.init('task');
    //i18n
    $scope.localLang = {
      search: $filter('translate')('ocsp_web_common_014'),
      nothingSelected : $filter('translate')('ocsp_web_common_017')
    };
    //Initialize charts and links
    mermaidAPI.initialize({
      startOnLoad:false
    });
    $scope.links = [];
    $http.get('/api/config/links').success(function(data){
      $scope.links = data;
    });
    $scope.auditTypes = [
      {name: 'always', displayName: $filter('translate')('ocsp_web_streams_subscribe_type_always')},
      {name: 'day', displayName: $filter('translate')('ocsp_web_streams_subscribe_type_day')},
      {name: 'week', displayName: $filter('translate')('ocsp_web_streams_subscribe_type_week')},
      {name: 'month', displayName: $filter('translate')('ocsp_web_streams_subscribe_type_month')}
    ];
    $scope.auditTimes = [
      {name: 'none' ,displayName: '无'},
      {name: 'have', displayName: '有'}
    ];
    //Check spark_home properties
    function _openSparkModal(){
      let modal = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title-bottom',
        ariaDescribedBy: 'modal-body-bottom',
        templateUrl: 'stackedModal.html',
        size: 'md',
        scope: $scope,
        backdrop: 'static',
        controller: ['$scope', function($scope) {
          $scope.closeModal = function(){
            modal.close();
          };
          $scope.inputSpark = function(){
            $http.post("/api/prop/spark", {spark: $scope.spark}).success(function(){
              modal.close();
              $scope._showModal();
            });
          };
        }]
      });
    }

    if($rootScope.isAdmin()) {
      $http.get("/api/prop/spark").success(function (result) {
        if (result === null || result === "" || result.value === "") {
          _openSparkModal();
        }
      });
    }

    $scope._showModal = function(){
      $scope.$broadcast('openModal',{});
    };

    function _graphs(charts){
      $scope.chartSeries0 = [$filter('translate')('ocsp_web_dashboard_reserved')];
      $scope.chartSeries1 = [$filter('translate')('ocsp_web_dashboard_dropped')];
      $scope.chartData0 = [charts.dealData[0]];
      $scope.chartData1 = [charts.dealData[1]];
      $scope.chartRunTimeSeries = [$filter('translate')('ocsp_web_dashboard5')];
      $scope.chartRunTimeLabels = [];
      $scope.chartRunTimeData = charts.batchtime;
      $scope.chartMemorySeries = [$filter('translate')('ocsp_web_dashboard_memory_used'), $filter('translate')('ocsp_web_dashboard_memory_available')];
      $scope.chartMemoryData = charts.mem_storage;
      for(let i in charts.runtimetimestamps){
        $scope.chartRunTimeLabels.push(moment(charts.runtimetimestamps[i]).format('YYYY-MM-DD HH:mm:ss'));
      }
    }

    //Actions and change
    $scope.actions = [
      {name: $filter('translate')('ocsp_web_streams_manage_024'), enable: true, icon : "glyphicon glyphicon-play success"},
      {name: $filter('translate')('ocsp_web_streams_manage_025'), enable: true, icon: "glyphicon glyphicon-stop danger"},
      {name: $filter('translate')('ocsp_web_streams_manage_026'), enable: true, icon: "glyphicon glyphicon-refresh danger"},
      {name: $filter('translate')('ocsp_web_streams_manage_027'), enable: true, icon: "glyphicon glyphicon-remove-sign warning"}
    ];

    function _dealWith(status) {
      if(status === "delete"){
        if($scope.selectedJob && $scope.jobs){
          let i;
          for(i in $scope.jobs){
            if($scope.jobs[i].id === $scope.selectedJob.id){
              break;
            }
          }
          if(i < $scope.jobs.length) {
            $scope.jobs.splice(i, 1);
          }
        }
      }else if(status === 0){
        $scope.actions = [
          {name: $filter('translate')('ocsp_web_streams_manage_024'), enable: true, icon : "glyphicon glyphicon-play success"},
          {name: $filter('translate')('ocsp_web_streams_manage_025'), enable: false, icon: "glyphicon glyphicon-stop"},
          {name: $filter('translate')('ocsp_web_streams_manage_026'), enable: false, icon: "glyphicon glyphicon-refresh"},
          {name: $filter('translate')('ocsp_web_streams_manage_027'), enable: true, icon: "glyphicon glyphicon-remove-sign warning"}
        ];
      }else if(status === 2){
        $scope.actions = [
          {name: $filter('translate')('ocsp_web_streams_manage_024'),  enable: false, icon : "glyphicon glyphicon-play"},
          {name: $filter('translate')('ocsp_web_streams_manage_025'), enable: true, icon: "glyphicon glyphicon-stop danger"},
          {name: $filter('translate')('ocsp_web_streams_manage_026'), enable: true, icon: "glyphicon glyphicon-refresh danger"},
          {name: $filter('translate')('ocsp_web_streams_manage_027'), enable: false, icon: "glyphicon glyphicon-remove-sign"}
        ];
      }else if(status === 5){
        $scope.actions = [
          {name: $filter('translate')('ocsp_web_streams_manage_024'),  enable: false, icon : "glyphicon glyphicon-play"},
          {name: $filter('translate')('ocsp_web_streams_manage_025'), enable: true, icon: "glyphicon glyphicon-stop danger"},
          {name: $filter('translate')('ocsp_web_streams_manage_026'), enable: false, icon: "glyphicon glyphicon-refresh"},
          {name: $filter('translate')('ocsp_web_streams_manage_027'), enable: false, icon: "glyphicon glyphicon-remove-sign"}
        ];
      }else{
        $scope.actions = [
          {name: $filter('translate')('ocsp_web_streams_manage_024'), enable: false, icon : "glyphicon glyphicon-play"},
          {name: $filter('translate')('ocsp_web_streams_manage_025'), enable: false, icon: "glyphicon glyphicon-stop"},
          {name: $filter('translate')('ocsp_web_streams_manage_026'), enable: false, icon: "glyphicon glyphicon-refresh"},
          {name: $filter('translate')('ocsp_web_streams_manage_027'), enable: false, icon: "glyphicon glyphicon-remove-sign"}
        ];
      }
    }

    $scope.statusName = function(item){
      switch(item){
        case 0: return "glyphicon glyphicon-warning-sign danger"; //stop
        case 1: return "glyphicon glyphicon-ok-sign success animated flash infinite"; // pre_start
        case 2: return "glyphicon glyphicon-ok-sign success"; // running
        case 3: return "glyphicon glyphicon-warning-sign danger animated flash infinite"; // pre_stop
        case 4: return "glyphicon glyphicon-ok-sign success animated flash infinite"; // pre_restart
        case 5: return "glyphicon glyphicon-refresh warning animated flash infinite"; // retry
      }
    };

    $scope.statusText = function(item){
      switch(item) {
        case 0:
          return $filter('translate')('ocsp_web_streams_manage_032');
        case 1:
          return $filter('translate')('ocsp_web_streams_manage_033');
        case 2:
          return $filter('translate')('ocsp_web_streams_manage_034');
        case 3:
          return $filter('translate')('ocsp_web_streams_manage_035');
        case 4:
          return $filter('translate')('ocsp_web_streams_manage_036');
        case 5:
          return $filter('translate')('ocsp_web_streams_manage_044');
      }
    };

    function _changeStatus(status){
      if(!$scope.selectedJob){
        //TODO: Globalization
        Notification.error("Cannot update null task");
      }else{
        $http.post("/api/task/change/" + $scope.selectedJob.id, {status: status}).success(function(){
          $scope.selectedJob.status = status;
          _dealWith(status);
          Notification.success($filter('translate')('ocsp_web_common_026'));
        });
      }
    }

    var isKerberosConfigureCorrect = function(userInfo){
      if(!userInfo.spark_keytab || !userInfo.spark_principal || !userInfo.kafka_keytab || !userInfo.kafka_principal){
        return false;
      }
      if(userInfo.spark_keytab === "" || userInfo.spark_principal === "" || userInfo.kafka_keytab === "" ||userInfo.kafka_principal === ""){
        return false;
      }
      return true;
    };

    $scope.changeStatus = function(item){
      let name = item.name;
      if(!item.enable){
        return;
      }
      let status = 0;
      if(name === $filter('translate')('ocsp_web_streams_manage_027')){
        $ngConfirm({
          title: $filter('translate')('ocsp_web_common_038'),
          content: $filter('translate')('ocsp_web_common_039'),
          scope: $scope,
          buttons:{
            ok:{
              text: $filter('translate')("ocsp_web_common_021"),
              action: function(){
                status = "delete";
                _changeStatus(status);
              }
            },
            cancel:{
              text: $filter('translate')("ocsp_web_common_020"),
            }
          }
        });
      }else{
        if (name === $filter('translate')('ocsp_web_streams_manage_024')) {
          status = 1;
        } else if (name === $filter('translate')('ocsp_web_streams_manage_025')) {
          status = 3;
        } else if (name === $filter('translate')('ocsp_web_streams_manage_026')) {
          status = 4;
        }
        if(status === 1){
          $q.all({prop: $http.get('/api/prop'), userInfo: $http.get('/api/user/' + $rootScope.username)}).then(function(arr){
            var props = arr.prop.data;
            var userInfo = arr.userInfo.data;
            var kerberosConfigureEnabled = false;
            for (var index in props) {
              if (props[index].name === 'ocsp.kerberos.enable') {
                kerberosConfigureEnabled = Boolean(props[index].value === 'true');
              }
            }
            if (kerberosConfigureEnabled) {
              if(!isKerberosConfigureCorrect(userInfo)){
                let modal = $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title-bottom',
                  ariaDescribedBy: 'modal-body-bottom',
                  templateUrl: 'kerberosConfigureMissingWarning.html',
                  size: 'lg',
                  backdrop: 'static',
                  scope: $scope,
                  controller: ['$scope', function ($scope) {
                    $scope.searchItem = {};
                    $scope.closeModal = function () {
                      modal.close();
                    };
                  }]
                });
              } else {
                // Kerberos is configured correct, but need check whether keytab file exists
                let filesNeedCheck = {
                  files: {
                    kafkaconfigfile: userInfo.kafka_keytab,
                    sparkconfigfile: userInfo.spark_keytab,
                    ocsp_kafka_jaas: userInfo.kafka_jaas
                  }
                };
                $http.post('/api/user/checkfiles',{"filesNeedCheck":filesNeedCheck}).success(function(data){
                  if(data.kafkaconfigfileexist && data.sparkconfigfileexist && data.ocsp_kafka_jaasexist){
                    _changeStatus(status);
                  } else {
                    if (!data.kafkaconfigfileexist) {
                      Notification.error("Kafka keytab " + $filter('translate')('ocsp_web_user_manage_010'));
                    }
                    if (!data.sparkconfigfileexist) {
                      Notification.error("Spark keytab " + $filter('translate')('ocsp_web_user_manage_010'));
                    }
                    if(!data.ocsp_kafka_jaasexist) {
                      Notification.error("Kafka Jaas Config " + $filter('translate')('ocsp_web_user_manage_010'));
                    }
                  }
                });

              }

            } else {
              _changeStatus(status);
            }
          });
        } else {
          _changeStatus(status);
        }
      }
    };

    // Global timer
    let taskInterval = $interval(function () {
      $http.get('/api/task/status').success(function(tasks){
        if($scope.jobs !== undefined && $scope.jobs.length > 0){
          for(let i in $scope.jobs){
            for(let j in tasks){
              if($scope.jobs[i].id === tasks[j].id){
                $scope.jobs[i].status = tasks[j].status;
                $scope.jobs[i].running_time = tasks[j].running_time;

                break;
              }
            }
          }
        }
        _dealWith($scope.selectedJob.status);
      });
    }, CONFIGS.taskInterval);
    let chartRefreshInterval = $interval(function(){
      if($scope.selectedJob.id !== undefined) {
        $http.get('/api/chart/taskData/' + $scope.selectedJob.id).success((data) => {
          _graphs(data);
        });
      }
    }, CONFIGS.chartRefreshInterval);
    $scope.$on('$destroy', function(){
      if(taskInterval) {
        $interval.cancel(taskInterval);
      }
      if(chartRefreshInterval){
        $interval.cancel(chartRefreshInterval);
      }
    });

    $scope.selectedJob = {
      input: {
        inputs: [],
        userFields:[]
      },
      events: []
    };

    function _init() {
      // Use for create new task
      $scope.task = {
        input: {
          inputs: []
        },
        events: []
      };
      $q.all({job: $http.get('/api/task'), datasource: $http.get('/api/datasource'), labels: $http.get('/api/label')}).then(function(arr){
        $scope.jobs = arr.job.data;
        $scope.datasources = arr.datasource.data;
        $scope.inputDatasources = [];
        for(let i in $scope.datasources){
          if($scope.datasources[i].type === 'kafka'){
            $scope.inputDatasources.push($scope.datasources[i]);
          }
        }
        $scope.inputLabels = arr.labels.data;
      });
    }

    _init();

    $scope.update = function(){
      if($scope.selectedJob.id === undefined || $scope.selectedJob.id === null){
        Notification.error("Cannot update null task");
      }else{
        if ($scope.mainForm.$invalid) {
          angular.forEach($scope.mainForm.$error, function (field) {
            angular.forEach(field, function(errorField){
              errorField.$setTouched();
            });
          });
          Notification.error($filter('translate')('ocsp_web_common_032'));
        }else {
          $http.put("/api/task", {task: $scope.selectedJob}).success(function () {
            Notification.success($filter('translate')('ocsp_web_common_026'));
          });
        }
      }
    };

    //Basic functions for page operation
    function _parseProperties(datainterface, prop, type = "output"){
      if(datainterface.delim === "\\|"){
        datainterface.delim = "|";
      }
      datainterface.inputs = [];
      if(prop !== undefined && prop !== null) {
        prop = JSON.parse(prop);
        datainterface.userFields = prop.userFields;
        if(prop.fields !== undefined && prop.fields.length > 0) {
          datainterface.fields = "";
          if (prop.fields.length > 0){
            datainterface.fields = prop.fields[0].pname;
          }
          for (let i = 1; i < prop.fields.length; i++) {
            if(prop.fields[i].pname !== undefined && prop.fields[i].pname.trim() !== "") {
              datainterface.fields += "," + prop.fields[i].pname;
            }
          }
        }
        if(prop.props !== undefined && prop.props.length > 0) {
          for (let i in prop.props) {
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
        if(prop.sources !== undefined && prop.sources.length > 0 && type === "input") {
          for(let i = 0 ; i < prop.sources.length; i++){
            let result = {
              topic: prop.sources[i].topic,
              name: prop.sources[i].pname,
              delim: prop.sources[i].delim === "\\|"?"|":prop.sources[i].delim,
              fields: "",
              userFields: []
            };
            if(prop.sources[i].fields !== undefined && prop.sources[i].fields.length > 0) {
              if (prop.sources[i].fields.length > 0){
                result.fields = prop.sources[i].fields[0].pname;
              }
              for (let j = 1; j < prop.sources[i].fields.length; j++) {
                if(prop.sources[i].fields[j].pname !== undefined && prop.sources[i].fields[j].pname.trim() !== "") {
                  result.fields += "," + prop.sources[i].fields[j].pname;
                }
              }
            }
            if(prop.sources[i].userFields !== undefined && prop.sources[i].userFields.length > 0) {
              for (let j = 0; j < prop.sources[i].userFields.length; j++) {
                result.userFields.push({
                  name: prop.sources[i].userFields[j].pname,
                  value: prop.sources[i].userFields[j].pvalue
                });
              }
            }
            datainterface.inputs.push(result);
          }
        }
      }
    }

    function _drawGraph(item, labels){
      let graphDefinition = 'graph LR;';
      graphDefinition += "task[" + item.name + "];";
      let last = "task";
      if(item.input.inputs.length > 0){
        graphDefinition += "subgraph  " + $filter('translate')('ocsp_web_streams_manage_038') + ";";
        for(let i = 0 ; i < item.input.inputs.length; i++){
          graphDefinition += `${item.input.inputs[i].name}(("${item.input.inputs[i].name}"));`;
        }
        graphDefinition += "end;";
        for(let i = 0 ; i < item.input.inputs.length; i++){
          graphDefinition += `task --> ${item.input.inputs[i].name};`;
        }
      }
      if(labels.length > 0) {
        graphDefinition += "subgraph " + $filter('translate')('ocsp_web_common_024') + ";";
        if (labels.length > 1){
          for (let i = 0 ; i < labels.length - 1 ; i++) {
            graphDefinition += labels[i].name + "-->" + labels[i + 1].name + ";";
          }
        }else{
          graphDefinition += labels[0].name + ";";
        }
        graphDefinition += "end;";
        for(let i = 0 ; i < item.input.inputs.length; i++){
          graphDefinition += `${item.input.inputs[i].name} --> ${labels[0].name};`;
        }
        if (labels.length > 1) {
          last = labels[labels.length - 1].name;
        }else{
          last = labels[0].name;
        }
      }else{ // Contain no labels
        graphDefinition += "subgraph " + $filter('translate')('ocsp_web_common_024') + ";";
        graphDefinition += "null(" + $filter('translate')('ocsp_web_common_036') + ");";
        graphDefinition += "style null fill:#6D6D65,stroke:#6D6D65,stroke-width:0px;";
        graphDefinition += "end;";
        for(let i = 0 ; i < item.input.inputs.length; i++){
          graphDefinition += `${item.input.inputs[i].name} --> null;`;
        }
        last = "null";
      }
      if(item.events.length > 0) {
        graphDefinition += "subgraph " + $filter('translate')('ocsp_web_common_025') + ";";
        for(let j in item.events){
          if(item.events[j].output === undefined){
            graphDefinition += `${item.events[j].name}(("${item.events[j].name}"));`;
          }else {
            if(item.events[j].status === 0){
              graphDefinition += `style ${item.events[j].name} fill:#7d7d7d,stroke:#81b1db,stroke-width:0px;`;
            }
            if(item.events[j].output.topic !== undefined) {
              graphDefinition += `${item.events[j].name}(("${item.events[j].name}(${item.events[j].output.topic})"));`;
            }else{
              graphDefinition += `${item.events[j].name}(("${item.events[j].name}"));`;
            }
          }
        }
        graphDefinition += "end;";
        for(let j in item.events) {
          graphDefinition += last + "-->" + item.events[j].name + ";";
        }
      }
      let element = document.querySelector("#mermaid");
      element.innerHTML= "";
      let insertSvg = function(svgCode){
        element.innerHTML = svgCode;
      };
      mermaidAPI.render('graphDiv', graphDefinition, insertSvg);
    }

    function _parseDatasource(dataInterface){
      for(let i in $scope.datasources){
        if($scope.datasources[i].id === dataInterface.dsid){
          dataInterface.datasource = $scope.datasources[i];
          break;
        }
      }
    }

    $scope.changeItem = function(item){
      $scope.selectedJob = item;
      $q.all({
        datainterface: $http.get('/api/datainterface/' + item.diid),
        labels: $http.get('/api/label/diid/' + item.diid),
        outputinterface: $http.get('/api/datainterface/output'),
        events: $http.get('/api/event/diid/' + item.diid),
        charts: $http.get('/api/chart/taskData/' + item.id)})
        .then(function(arr){
          $scope.selectedJob.input = arr.datainterface.data[0];
          $scope.selectedJob.output = arr.outputinterface.data;
          $scope.selectedJob.events = arr.events.data;
          let labels = [];
          //Deal with input properties
          _parseDatasource($scope.selectedJob.input);
          _parseProperties($scope.selectedJob.input, $scope.selectedJob.input.properties, "input");
          //Deal with labels
          for (let j in $scope.inputLabels) {
            $scope.inputLabels[j].tick2 = false;
          }
          for (let i in arr.labels.data) {
            for (let j in $scope.inputLabels) {
              if (arr.labels.data[i].label_id === $scope.inputLabels[j].id) {
                $scope.inputLabels[j].tick2 = true;
                labels.push($scope.inputLabels[j]);
              }
            }
          }
          let temp = $scope.inputLabels;
          $scope.inputLabels = [];
          for(let j in labels){
            $scope.inputLabels.push(labels[j]);
          }
          for(let i in temp){
            let flag = true;
            for(let j in labels){
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
          for(let i in $scope.selectedJob.events){
            if($scope.selectedJob.events[i].PROPERTIES !== undefined && $scope.selectedJob.events[i].PROPERTIES !== null) {
              $scope.selectedJob.events[i].PROPERTIES = JSON.parse($scope.selectedJob.events[i].PROPERTIES);
              if($scope.selectedJob.events[i].PROPERTIES.props !== undefined && $scope.selectedJob.events[i].PROPERTIES.props.length > 0) {
                for (let j in $scope.selectedJob.events[i].PROPERTIES.props) {
                  if ($scope.selectedJob.events[i].PROPERTIES.props[j].pname === "userKeyIdx") {
                    $scope.selectedJob.events[i].userKeyIdx = $scope.selectedJob.events[i].PROPERTIES.props[j].pvalue;
                  }
                  if ($scope.selectedJob.events[i].PROPERTIES.props[j].pname === "period") {
                    $scope.selectedJob.events[i].PROPERTIES.props[j].pvalue = JSON.parse($scope.selectedJob.events[i].PROPERTIES.props[j].pvalue);
                    $scope.selectedJob.events[i].audit = {
                      type : $scope.selectedJob.events[i].PROPERTIES.props[j].pvalue.period,
                      periods : []
                    };
                    if($scope.selectedJob.events[i].PROPERTIES.props[j].pvalue.startDate && $scope.selectedJob.events[i].PROPERTIES.props[j].pvalue.endDate){
                      $scope.selectedJob.events[i].audit.enableDate = "have";
                      $scope.selectedJob.events[i].audit.startDate = moment($scope.selectedJob.events[i].PROPERTIES.props[j].pvalue.startDate).toDate();
                      $scope.selectedJob.events[i].audit.endDate = moment($scope.selectedJob.events[i].PROPERTIES.props[j].pvalue.endDate).toDate();
                    }else{
                      $scope.selectedJob.events[i].audit.enableDate = "none";
                    }
                    for (let w in $scope.selectedJob.events[i].PROPERTIES.props[j].pvalue.time){
                      let val = $scope.selectedJob.events[i].PROPERTIES.props[j].pvalue.time[w];
                      $scope.selectedJob.events[i].audit.periods.push({
                        s: val.begin.d,
                        d: val.end.d,
                        start: moment("2010-07-01 " + val.begin.h).toDate(),
                        end: moment("2010-07-01 " + val.end.h).toDate()
                      });
                    }
                  }
                  if($scope.selectedJob.events[i].PROPERTIES.props.length === 1) {
                  	$scope.selectedJob.events[i].audit={ type : "always", periods : [], enableDate: "none"};
                  }
          		  }

              if($scope.selectedJob.events[i].PROPERTIES.output_dis !== undefined && $scope.selectedJob.events[i].PROPERTIES.output_dis[0] !== undefined) {
                $scope.selectedJob.events[i].interval = $scope.selectedJob.events[i].PROPERTIES.output_dis[0].interval;
                $scope.selectedJob.events[i].delim = $scope.selectedJob.events[i].PROPERTIES.output_dis[0].delim;
                if($scope.selectedJob.events[i].delim === "\\|"){
                  $scope.selectedJob.events[i].delim = "|";
                }
                for(let j in $scope.selectedJob.output){
                  if($scope.selectedJob.output[j].id === parseInt($scope.selectedJob.events[i].PROPERTIES.output_dis[0].diid)){
                    $scope.selectedJob.events[i].output = $scope.selectedJob.output[j];
                    _parseProperties($scope.selectedJob.events[i].output, $scope.selectedJob.events[i].output.properties);
                    _parseDatasource($scope.selectedJob.events[i].output);
                    break;
                  }
                }
              }
        	  }
          }
  		  }
          _dealWith($scope.selectedJob.status);
          _drawGraph($scope.selectedJob, labels);
          _graphs(arr.charts.data);
        });
    };

    $scope.generate = function(inputs, array){
      let str = "";
      if(array !== undefined && array.length > 0) {
        let result = new Set();
        if(array[0].fields !== undefined && array[0].fields.trim() !== ""){
          result = new Set(strService.split(array[0].fields));
        }
        for (let i = 1 ; i < array.length; i++) {
          let tmp = new Set();
          if(array[i].fields !== undefined && array[i].fields.trim() !== ""){
            let splits = strService.split(array[i].fields);
            for(let j in splits){
              if(result.has(splits[j])){
                tmp.add(splits[j]);
              }
            }
          }
          result = tmp;
        }
        let resultArray = [...result];
        if(resultArray.length > 0){
          str = resultArray[0];
          for(let i = 1 ; i < resultArray.length; i++){
            str += "," + resultArray[i];
          }
        }
      }
      inputs.fields = str;
    };

    $scope.submitMethod = function(){
      let defer = $q.defer();
      $ngConfirm({
        title: $filter('translate')('ocsp_web_common_038'),
        content: $filter('translate')('ocsp_web_common_039'),
        scope: $scope,
        buttons:{
          ok:{
            text: $filter('translate')("ocsp_web_common_021"),
            action: function(){
              $http.post("/api/task", {task: $scope.task}).success(function(){
                $scope.task = {
                  input: {},
                  events: []
                };
                Notification.success($filter('translate')('ocsp_web_common_026'));
                _init();
                defer.resolve();
              });
            }
          },
          cancel:{
            text: $filter('translate')("ocsp_web_common_020"),
            action: function(){
              defer.reject();
            }
          }
        }
      });
      return defer.promise;
    };

    //Page helpers

    $scope.tab = "summary";
    $scope.changeTab = function(name){
      $scope.tab = name;
    };

    $scope.remove = function(array, $index){
      array.splice($index,1);
    };

    $scope.add = function (array) {
      if(array !== undefined) {
        array.push({
          status: 1,
          output: {},
          userFields: []
        });
      }
    };

    $scope.addUserField = function (input) {
      if(input.userFields === undefined || input.userFields === null){
        input.userFields = [];
      }
      input.userFields.push({
        pname:"",
        pvalue:""
      });
    };

    $scope.selectedRecoverMode = function(str){
      $scope.selectedJob.recover_mode = str;
    };

    $scope.onSelect = function(item){
      //Clear periods when select audit type
      item.audit.periods = [{}];
    };

    $scope.sortLabels = function(arr, index){
      let temp = $scope.inputLabels;
      arr.splice(index, 1);
      $scope.inputLabels = arr;
      for(let i in temp){
        let flag = true;
        for(let j in arr){
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

    $scope.getAllPossibleFields = function(fields,userFields){
      let resultStr = fields;
      if(userFields!==undefined && userFields!==null){
        userFields.forEach((x) => { resultStr += "," + x.pname; });
      }
      return resultStr;
    };    

    $scope.outputFieldsInvalid = false;
    $scope.outputFieldsInvalidMessage = "";

    $scope.trimStr = function(str){
      return str.replace(/(^\s*)|(\s*$)/g, '');
    };


    $scope.checkOutputFields = function(select_expr,fields,userFields){
      let invalidOuptuFields = [];

      if(!!select_expr){
        let existsFields = fields.split(',');
        if(userFields!==undefined && userFields!==null){
          existsFields.concat(userFields.map((x) => x.pname));
          userFields.forEach((x) => { existsFields.push(x.pname); });
        }

        let outputFields = select_expr.split(',');

        for(let idx in outputFields){
          let tmpExistCheck = false;
          for(let innerIdx in existsFields){
            if($scope.trimStr(outputFields[idx]) === $scope.trimStr(existsFields[innerIdx])){
              tmpExistCheck = true;
              break;
            }
          }
          if(!tmpExistCheck){
            invalidOuptuFields.push(outputFields[idx]);
          }
        }

        if(invalidOuptuFields.length!==0){
          $scope.outputFieldsInvalid = true;
          $scope.outputFieldsInvalidMessage = invalidOuptuFields.join(',') + $filter('translate')('ocsp_web_common_035');
        }else {
          $scope.outputFieldsInvalid = false;
          $scope.outputFieldsInvalidMessage = "";  
        }

      } else {
        $scope.outputFieldsInvalid = false;
        $scope.outputFieldsInvalidMessage = "";
      }
      
    };

  }]);
