"use strict";
var cpmodule = angular.module('fridgemagnets');
cpmodule.
    constant('ROUTES', {
    '/fridge': {
      templateUrl: 'partials/home.html',
      controller: 'HomeCtrl',
    },
    '/fridge/:name/': {
      templateUrl: 'partials/home.html',
      controller: 'HomeCtrl',
    },
    '/about': {
      templateUrl: 'partials/about.html',
      controller: 'AboutCtrl'
    },
    '/setupEmbeddedFridge': {
      templateUrl: 'partials/home.html',
      controller: 'HomeCtrl',
    },
    '/embeddedFridge': {
      templateUrl: 'partials/home.html',
      controller: 'HomeCtrl',
    },
    '/embeddedFridge/:name': {
      templateUrl: 'partials/home.html',
      controller: 'HomeCtrl',
    }
  })

  .config(['$routeProvider', 'ROUTES', function($routeProvider, ROUTES) {
    angular.forEach(ROUTES, function(route, path) {
        $routeProvider.when(path, route);
    });
    $routeProvider.otherwise({redirectTo: '/fridge'});
  }]);

