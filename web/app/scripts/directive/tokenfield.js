'use strict';
/**
 * Wizard directive
 */
angular.module('ocspApp').directive('tokenfield',['strService', function(strService) {
  return {
    restrict: 'E',
    templateUrl: 'views/directive/tokenfield.html',
    transclude: true,
    replace: true,
    scope: {
      ngModel: '=',
      change: '&'
    },
    link: function (scope, element, attrs) {
      let _findLabelTips = function(){
        let [inputs, labels] = [attrs.inputs, attrs.labels];
        let result = new Set();
        if(inputs !== undefined && inputs.trim() !== ""){
          result = new Set(strService.split(inputs));
        }
        if(labels !== undefined && labels.trim() !== ""){
          labels = JSON.parse(labels);
          for(let i in labels){
            if(labels[i].properties !== undefined) {
              let items = JSON.parse(labels[i].properties);
              if(items && items.labelItems && items.labelItems.length > 0) {
                for (let j in items.labelItems) {
                  if (!result.has(items.labelItems[j].pvalue)) {
                    result.add(items.labelItems[j].pvalue);
                  }
                }
              }
            }
          }
        }
        return [...result];
      };
      scope.bRequired = attrs !== undefined && attrs.required === 'true';
      let _bDisabled = attrs !== undefined && attrs.disabled === 'true';
      let _bReadonly = attrs !== undefined && attrs.readonly === 'true';
      let $e = element.find('input');
      let token = {};
      // Add tips
      token = $e.tokenfield({
        autocomplete: {
          source: _findLabelTips(),
          delay: 100
        },
        sortable: true,
      });
      attrs.$observe('inputs', () => {
        $e.data('bs.tokenfield').$input.autocomplete({source: _findLabelTips()});
      });
      attrs.$observe('labels', () => {
        $e.data('bs.tokenfield').$input.autocomplete({source: _findLabelTips()});
      });
      //Disable duplicated keys
      $e.on('tokenfield:createtoken', function (event) {
        let existingTokens = $(this).tokenfield('getTokens');
        $.each(existingTokens, function(index, token) {
          if (token.value === event.attrs.value) {
            event.preventDefault();
          }
        });
      });
      scope.$watch('ngModel', function() {
        token.tokenfield('setTokens', scope.ngModel);
        if(scope.change){
          scope.change();
        }
      });
      if(_bDisabled) {
        element.find("input.token-input").attr('disabled',true);
      }
      if(_bReadonly) {
        token.tokenfield('disable');
      }
      token.on('tokenfield:sorttoken', function(){
        scope.$apply(function(){
          let fields = token.tokenfield('getTokens');
          let results = "";
          if (fields.length > 0){
            results = fields[0].value;
          }
          for (let i = 1; i < fields.length; i++) {
            if(fields[i].value !== undefined && fields[i].value.trim() !== "") {
              results += "," + fields[i].value;
            }
          }
          scope.ngModel = results;
        });
      });
    }
  };
}]);

