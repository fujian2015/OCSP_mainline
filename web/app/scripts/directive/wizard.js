'use strict';
/**
 * Wizard directive
 */
angular.module('ocspApp').directive('wizard',['$filter', function($filter){
  return {
    restrict: 'E',
    templateUrl: 'views/directive/wizard.html',
    transclude: true,
    replace: true,
    scope:{
      submitMethod: "&",
      task: "="
    },
    link : function(scope, element, attrs) {
      var options = {
        contentWidth : attrs.width,
        contentHeight : 600,
        backdrop: 'static',
        buttons: {
          cancelText: $filter('translate')('ocsp_web_common_020'),
          nextText: $filter('translate')('ocsp_web_common_007'),
          backText: $filter('translate')('ocsp_web_common_008'),
          submitText: $filter('translate')('ocsp_web_common_021'),
          submittingText: $filter('translate')('ocsp_web_common_022')
        }
      };
      var wizard = element.find(".wizard");
      wizard.attr("data-title",attrs.title);
      wizard.find("div.wizard-card").each(function(){
        var cardname = $(this).attr("data-cardname");
        $(this).prepend("<h3 style='display: none'>" + $filter('translate')(cardname) + "</h3>");
      });
      element.find("button.wizard-button").text($filter('translate')(attrs.name));
      var wizardModal = wizard.wizard(options);
      scope.showModal = function(){
        wizardModal.show();
      };
      scope.$on('openModal',function(){
        wizardModal.show();
      });
      wizardModal.on("closed", function(){
        wizardModal.reset();
      });
      wizardModal.cards["ocsp_web_common_013"].on("validate", function (card) {
        var input = card.el.find("input[required]");
        var flag = true;
        input.each(function(){
          var name = $(this).val();
          if (name === "") {
            $(this).addClass("redBlock");
            card.wizard.errorPopover($(this), "Cannot be empty");
            flag = false;
          }else{
            $(this).siblings("div.error-popover").remove();
            $(this).removeClass("redBlock");
          }
        });
        return flag;
      });
      for(var i = 6; i < 9 ; i++) {
        wizardModal.cards["ocsp_web_streams_manage_00" + i].on("validate", function (card) {
          var input = card.el.find("input[required]");
          var flag = true;
          input.each(function(){
            var name = $(this).val();
            if (name === "") {
              $(this).addClass("redBlock");
              card.wizard.errorPopover($(this), "Cannot be empty");
              flag = false;
            }else{
              $(this).siblings("div.error-popover").remove();
              $(this).removeClass("redBlock");
            }
          });
          if(card.name === "ocsp_web_streams_manage_006" || card.name === "ocsp_web_streams_manage_008") {
            card.el.find("div.ng-invalid").each(function(){
              $(this).addClass("redBlock");
              card.wizard.errorPopover($(this), "Cannot be empty");
              flag = false;
            });
            card.el.find("div.ng-valid").each(function(){
              $(this).siblings("div.error-popover").remove();
              $(this).removeClass("redBlock");
            });
          }
          return flag;
        });
      }
      wizardModal.on("submit", function() {
        var promise = scope.submitMethod();
        promise.then(function () {
          wizardModal.submitSuccess();
          wizardModal.reset();
          wizardModal.close();
        }, function () {
          wizardModal.submitFailure();
          wizardModal.reset();
        });
      });
    }
  };
}]);
