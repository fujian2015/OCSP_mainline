'use strict';
/**
 * Date filter
 */
angular.module('ocspApp').filter('cusDate',['$filter', function($filter) {
  return function(input){
    input = parseInt(input);
    if(isNaN(input)){
      return "";
    }
    var h = Math.floor(input / 3600);
    input = input % 3600;
    var m = Math.floor(input / 60);
    var s = input % 60;
    return h + $filter('translate')('timeh') + m + $filter('translate')('timem') + s + $filter('translate')('times');
  }
}]);

