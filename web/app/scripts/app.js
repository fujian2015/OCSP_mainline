'use strict';

/**
 * @ngdoc overview
 * @name ocspApp
 * @description
 * # ocspApp
 *
 * Main module of the application.
 */
angular
  .module('ocspApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'pascalprecht.translate',
    'ngFileUpload',
    "isteven-multi-select",
    "dndLists",
    'ui.bootstrap',
    'ui-notification',
    'angularSpinner',
    'ngCookies',
    'ui.select',
    'toggle-switch',
    'cfp.hotkeys'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/task_management', {
        templateUrl: 'views/task/management.html',
        controller: 'TaskManagementCtrl'
      })
      .when('/label_management',{
        templateUrl: 'views/label/management.html',
        controller: 'LabelManagementCtrl'
      })
      .when('/system_management',{
        templateUrl: 'views/system/management.html',
        controller: 'SystemManagementCtrl'
      })
      .when('/user_management',{
        templateUrl: 'views/user/management.html',
        controller: 'UserManagementCtrl'
      })
      .otherwise({
        controller : function(){
          window.location.replace('/404');
        },
        template : "<div></div>"
      });
  }).config(function (NotificationProvider){
    NotificationProvider.setOptions({
      delay: 10000,
      startTop: 20,
      startRight: 10,
      verticalSpacing: 20,
      horizontalSpacing: 20,
      positionX: 'right',
      positionY: 'bottom'
    });
  })
  .config(['usSpinnerConfigProvider', function (usSpinnerConfigProvider) {
    usSpinnerConfigProvider.setDefaults({color: 'orange', radius: 20});
  }])
  .config(['$translateProvider', '$windowProvider', function($translateProvider, $windowProvider){
    var window = $windowProvider.$get();
    var lang = window.navigator.userLanguage || window.navigator.language;
    if(lang){
      lang = lang.substr(0,2);
      $translateProvider.preferredLanguage(lang);
    }
  }]).run(['$rootScope', 'loginService', function($rootScope, loginService){
    $rootScope.username = null;
    $rootScope.tab = null;
    $rootScope.message = null;
    $rootScope.styles = null;
    $rootScope.logout = function(){
      loginService.logout();
    };
    $rootScope.changeTab = function(tab){
      $rootScope.tab = tab;
    };
  }]);
