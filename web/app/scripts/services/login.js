'use strict';
/**
 * login service provider
 */
angular.module('ocspApp')
  .service('loginService',['$cookies', '$rootScope', '$location', function($cookies, $rootScope, $location) {
  this.login = function (username) {
    $cookies.put("username", username);
    $location.path("/task_management");
    $rootScope.changeTab('task');
  };
  this.logout = function() {
    $cookies.remove("username");
    $rootScope.username = null;
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
