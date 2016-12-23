'use strict';

/**
 * For label management main page controller
 */
angular.module('ocspApp')
  .controller('SystemManagementCtrl', ['$scope', '$http', 'Notification', '$q', 'usSpinnerService', 'loginService', '$filter', function ($scope, $http, Notification, $q, usSpinnerService, loginService, $filter) {
    loginService.init('system');
    function init() {
      usSpinnerService.spin('spinner');
      $q.all({prop: $http.get('/api/prop'), datasource: $http.get('/api/datasource')}).then(function(arr){
        $scope.prop = arr.prop.data;
        $scope.datasource = arr.datasource.data;
        if($scope.datasource !== undefined && $scope.datasource.length > 0) {
          for (var i in $scope.datasource) {
            $scope.datasource[i].props = JSON.parse($scope.datasource[i].properties);
          }
        }
        usSpinnerService.stop('spinner');
      },function(err){
        Notification.error(err.data);
        usSpinnerService.stop('spinner');
      });
    }

    init();

    $scope.add = function (name) {
      $scope[name].push({});
    };

    $scope.delete = function (name, index){
      $scope[name].splice(index,1);
    };

    $scope.save = function(){
      for (var i in $scope.datasource) {
        $scope.datasource[i].properties = JSON.stringify($scope.datasource[i].props);
      }
      $q.all({prop: $http.post("/api/prop", {data : $scope.prop}), datasource: $http.post("/api/datasource", {data : $scope.datasource})})
        .then(function(){
          Notification.success($filter('translate')('ocsp_web_common_026'));
        }, function(err){
          usSpinnerService.stop('spinner');
          Notification.error(err.data);
        });
    };
  }]);
