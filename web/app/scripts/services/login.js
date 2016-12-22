'use strict';
/**
 * login service provider
 */
angular.module('ocspApp')
  .service('loginService',['$cookies', '$rootScope', '$location', '$http', '$filter', 'usSpinnerService', function($cookies, $rootScope, $location, $http, $filter, usSpinnerService) {
  this.login = function (username ,password) {
    usSpinnerService.spin('spinner');
    $http.post("/api/user/login/" + username, {pass: password}).success(function (user) {
      usSpinnerService.stop('spinner');
      if (user.status) {
        $cookies.put("username", username);
        $location.path("/task_management");
        $rootScope.styles = null;
        $rootScope.changeTab('task');
      } else {
        $rootScope.message = $filter('translate')('ocsp_web_user_manage_005');
        $rootScope.styles = "redBlock";
        $cookies.remove("username");
      }
    }).error(function(err){
      $rootScope.message = err;
      usSpinnerService.stop('spinner');
    });
  };
  this.logout = function() {
    $cookies.remove("username");
    $rootScope.username = null;
    $rootScope.message = null;
    $rootScope.styles = null;
    $location.path("/");
  };
  this.init = function(tab){
    var name = $cookies.get("username");
    if(name === null || name === undefined){
      $rootScope.username = null;
      $location.path("/");
    }else {
      $rootScope.changeTab(tab);
      $rootScope.username = name;
    }
  };
}]);
