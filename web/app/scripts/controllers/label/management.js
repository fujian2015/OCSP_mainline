'use strict';

/**
 * For label management main page controller
 */
angular.module('ocspApp')
  .controller('LabelManagementCtrl', ['$scope', '$http', 'Upload', 'Notification', '$timeout', 'loginService', function ($scope, $http, Upload, Notification, $timeout, loginService) {
    loginService.init('label');
    function init() {
      $http.get('/api/label').success(function (data) {
        $scope.labels = data;
      }).error(function(err){
        Notification.error(err);
      });
    }

    init();

    $scope.upload = function(){
      $scope.uploadFile($scope.file);
    };

    $scope.save = function(){
      $http.post("/api/label", {labels: $scope.labels}).success(function(){
        init();
        Notification.success("Save success!");
      }).error(function(err){
        Notification.error(err);
      });
    };

    $scope.uploadFile = function (file) {
      Upload.upload({
        url:'/api/label/upload',
        data: {file: file, username: 'jar'}
      }).then(function () {
          $timeout(function(){
            init();
            Notification.success("Upload labels success");
          }, 1000);
        }, function (err) {
          Notification.error(err.data);
        }, function (evt) {
          file.progress = Math.min(100, parseInt(100.0 *
            evt.loaded / evt.total));
        });
    };

  }]);
