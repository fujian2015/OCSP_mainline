'use strict';

/**
 * For label management main page controller
 */
angular.module('ocspApp')
  .controller('SystemManagementCtrl', ['$scope', '$http', 'Notification', '$q', 'usSpinnerService', 'loginService', '$filter', '$uibModal', function ($scope, $http, Notification, $q, usSpinnerService, loginService, $filter, $uibModal) {
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

    $scope.remove = function($index){
      $scope.datasource.splice($index,1);
    };

    $scope.trans = function(str){
      return str.replace(/\./g, '_');
    };
    $scope.openSparkModal = function(){
      var modal = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title-bottom',
        ariaDescribedBy: 'modal-body-bottom',
        templateUrl: 'stackedModal.html',
        size: 'lg',
        scope: $scope,
        controller: ['$scope', 'Notification', function($scope, Notification) {
          $scope.saveDatasource = function () {
            if($("#mainFrame .ng-invalid").length === 0) {
              if (confirm($filter('translate')('ocsp_web_system_manage_004'))) {
                $http.post("/api/datasource", {data: $scope.newDatasource}).success(function () {
                  modal.close();
                  $scope.newDatasource = {};
                  Notification.success($filter('translate')('ocsp_web_common_026'));
                  init();
                }).error(function (err) {
                  Notification.error(err);
                });
              }
            }
          };
        }]
      });
    };

    $scope.save = function(){
      for (var i in $scope.datasource) {
        $scope.datasource[i].properties = JSON.stringify($scope.datasource[i].props);
      }
      $q.all({
          prop: $http.post("/api/prop", {data: $scope.prop}),
          datasource: $http.put("/api/datasource", {data: $scope.datasource})
        })
        .then(function () {
          Notification.success($filter('translate')('ocsp_web_common_026'));
        }, function (err) {
          usSpinnerService.stop('spinner');
          Notification.error(err.data);
        });
    };

  }]);
