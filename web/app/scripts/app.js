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
    'cfp.hotkeys',
    'ui.bootstrap.datetimepicker',
    'angularMoment',
    'chart.js',
    'angularBootstrapNavTree',
    'textAngular',
    'cp.ngConfirm',
    'ngTable'
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
      .when('/label_management', {
        templateUrl: 'views/label/management.html',
        controller: 'LabelManagementCtrl'
      })
      .when('/system_management', {
        templateUrl: 'views/system/management.html',
        controller: 'SystemManagementCtrl'
      })
      .when('/user_management', {
        templateUrl: 'views/user/management.html',
        controller: 'UserManagementCtrl'
      })
      .when('/dashboard', {
        templateUrl: 'views/dashboard/dashboard.html',
        controller: 'DashboardCtrl'
      })
      .when('/events_center', {
        templateUrl: 'views/events/center.html',
        controller: 'EventsCenterCtrl',
        resolve: {
          cepConfig: function ($http,$rootScope,$location) {
            $http.get("/api/config/cepEnable").success((data) => {
              $rootScope.cep = JSON.parse(data);
              if(!$rootScope.cep){
                $location.path('/');
              }
            });
          }
        }
      })
      .otherwise({
        controller: function () {
          window.location.replace('/404');
        },
        template: "<div></div>"
      });
  })
  .config(['NotificationProvider', 'usSpinnerConfigProvider', '$httpProvider', 'ChartJsProvider', function (NotificationProvider, usSpinnerConfigProvider, $httpProvider, ChartJsProvider) {
    NotificationProvider.setOptions({
      delay: 10000,
      startTop: 20,
      startRight: 10,
      verticalSpacing: 20,
      horizontalSpacing: 20,
      positionX: 'right',
      positionY: 'bottom'
    });
    usSpinnerConfigProvider.setDefaults({ color: 'orange', radius: 20 });
    $httpProvider.interceptors.push('AuthInterceptor', 'UsInterceptor');
    ChartJsProvider.setOptions({
      chartColors: ['#4da9ff', '#79d2a6', '#ff9900', '#ff704d', '#669999', '#4d0000']
    });
  }])
  .config(['$translateProvider', '$windowProvider', function ($translateProvider, $windowProvider) {
    let window = $windowProvider.$get();
    let lang = window.navigator.userLanguage || window.navigator.language;
    if (lang) {
      lang = lang.substr(0, 2);
      $translateProvider.preferredLanguage(lang);
    }
  }])
  .constant('CONFIGS', {
    taskInterval: 5000,
    chartRefreshInterval: 20000
  })
  .run(['$rootScope', '$filter', '$cookies', '$location', '$http',
    ($rootScope, $filter, $cookies, $location, $http) => {
      $rootScope.title = $filter('translate')('ocsp_web_common_000');
      $rootScope.username = null;
      $rootScope.tab = null;
      $rootScope.message = null;
      $rootScope.styles = null;
      $http.get("/api/config/cepEnable").success((data) => {
        $rootScope.cep = JSON.parse(data);
      });
      $rootScope.changeTab = (tab) => {
        $rootScope.tab = tab;
      };
      $rootScope.logout = () => {
        $cookies.remove("username");
        $rootScope.username = null;
        $rootScope.message = null;
        $rootScope.styles = null;
        $location.path("/");
      };
      $rootScope.isAdmin = () => {
        let name = $cookies.get("username");
        return name === "ocspadmin";
      };
      $rootScope.login = (username, password) => {
        $http.post("/api/user/login/", { username, password }).success(function (user) {
          if (user.status) {
            $cookies.put("username", username);
            $cookies.put("token", user.token);
            if ($rootScope.isAdmin()) {
              $location.path("/dashboard");
            } else {
              $location.path("/task_management");
            }
            $rootScope.styles = null;
            $rootScope.message = null;
            $rootScope.changeTab('task');
          } else {
            $rootScope.message = $filter('translate')('ocsp_web_user_manage_005');
            $rootScope.styles = "redBlock";
            $cookies.remove("username");
          }
        }).error(function (err) {
          $rootScope.message = err;
        });
      };
      $rootScope.getUsername = () => {
        return $cookies.get("username");
      };
      $rootScope.getToken = () => {
        return $cookies.get("token");
      };
      $rootScope.init = (tab, adminGuard = false) => {
        let name = $cookies.get("username");
        if (name === null || name === undefined) {
          $rootScope.username = null;
          $cookies.remove("username");
          $rootScope.message = $filter('translate')('ocsp_web_user_manage_007');
          $rootScope.styles = "redBlock";
          $location.path("/");
        } else {
          if (adminGuard && !$rootScope.isAdmin()) {
            $rootScope.username = null;
            $cookies.remove("username");
            $rootScope.message = $filter('translate')('ocsp_web_user_manage_008');
            $rootScope.styles = "redBlock";
            $location.path("/");
          } else {
            $rootScope.changeTab(tab);
            $rootScope.username = name;
          }
        }
      };
    }]);
