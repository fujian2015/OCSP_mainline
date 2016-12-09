'use strict';

/**
 * @ngdoc function
 * @name ocspApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ocspApp
 */
angular.module('ocspApp')
  .controller('MainCtrl',['$scope', '$location', 'loginService', function ($scope, $location, loginService) {
    $scope.user = {};
    $scope.login = function(){
      loginService.login($scope.user.name);
    };

}]);
