'use strict';
/**
 * Wizard directive
 */
angular.module('ocspApp').directive('tokenfield',[function() {
  return {
    restrict: 'E',
    templateUrl: 'views/directive/tokenfield.html',
    transclude: true,
    replace: true,
    scope: {
      ngModel: '='
    },
    link: function (scope, element) {
      var $e = element.find('input');
      var token = $e.tokenfield({
        sortable: true
      });
      scope.$watch('ngModel', function() {
        token.tokenfield('setTokens', scope.ngModel);
      });
      token.on('tokenfield:sorttoken', function(){
        scope.$apply(function(){
          var fields = token.tokenfield('getTokens');
          var results = "";
          if (fields.length > 0){
            results = fields[0].value;
          }
          for (var i = 1; i < fields.length; i++) {
            if(fields[i].value !== undefined && fields[i].value !== "") {
              results += "," + fields[i].value;
            }
          }
          scope.ngModel = results;
        });
      });
    }
  };
}]);

