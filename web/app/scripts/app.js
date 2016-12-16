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
    $translateProvider.translations('en',{
      'task_manage':'Task management',
      'label_manage':'Label management',
      'system_manage':'System Management',
      'user_manage':'User Management',
      'create_task':'Create Task',
      'create_task_1':'Basic configuration',
      'create_task_2':'Set input',
      'create_task_3':'Set label',
      'create_task_4':'Set output',
      'create_task_5':'Review & submit',
      'add_task':'Add task',
      'system_properties':'System properties',
      'current_password':'Current password',
      'new_password':'New password',
      'new_password_again':'Confirm',
      'change_password':'Change password',
      'password_wrong':'Password is wrong, please double check.',
      'username':'Username',
      'password':'Password',
      'login':'login',
      'pass_not_same':'Input passwords are not same'
    });

    $translateProvider.translations('zh',{
      'task_manage':'任务管理',
      'label_manage':'标签管理',
      'system_manage':'系统管理',
      'user_manage':'用户管理',
      'create_task':'新建任务',
      'create_task_1':'基础配置',
      'create_task_2':'设置输入',
      'create_task_3':'设置标签',
      'create_task_4':'设置输出',
      'create_task_5':'检查&提交',
      'add_task':'新增任务',
      'system_properties':'系统属性',
      'current_password':'当前密码',
      'new_password':'新密码',
      'new_password_again':'再次输入',
      'change_password':'修改密码',
      'password_wrong':'密码错误，请重试。',
      'username':'用户名',
      'password':'密码',
      'login':'登录',
      'pass_not_same':'两次输入的密码不一致'
    });

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
