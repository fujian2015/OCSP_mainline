'use strict';

/**
 * For label management main page controller
 */
angular.module('ocspApp')
  .controller('UserManagementCtrl', ['$scope', '$http', 'loginService', '$rootScope', '$filter', 'Notification', 'usSpinnerService', 'hotkeys', function ($scope, $http, loginService, $rootScope, $filter, Notification, usSpinnerService, hotkeys) {
    loginService.init('user');
    $scope.message = null;
    $scope.styles = null;
    $scope.user = {
      name: $rootScope.username
    };
    $scope.checkPassword = function(){
      if($scope.user.password !== undefined && $scope.user.password2 !== undefined && $scope.user.password === $scope.user.password2){
        $scope.message = null;
        $scope.styles = null;
      }else{
        $scope.message = $filter('translate')('ocsp_web_user_manage_006');
        $scope.styles = "redBlock";
      }
    };
    hotkeys.bindTo($scope).add({
      combo: 'enter',
      allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
      callback: function() {
        $scope.save();
      }
    });
    $scope.save = function(){
      $scope.checkPassword();
      if($scope.message === null) {
        usSpinnerService.spin('spinner');
        $http.post('/api/user/change', {"user": $scope.user}).success(function (data) {
          if(data.status) {
            $scope.user = {
              name: $rootScope.username
            };
            Notification.success("Save user success");
          }else{
            Notification.error("Save user error, please check your password");
          }
          usSpinnerService.stop('spinner');
        }).error(function (err) {
          usSpinnerService.stop('spinner');
          Notification.error(err);
        });
      }
    };
  }]);
