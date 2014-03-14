'use strict';
var pathfinder = angular.module('Pathfinder', ['ngRoute']);

pathfinder.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'partials/welcome.html',
                controller: 'WelcomeCtrl'
            });

        $routeProvider.
            when('/global', {
                templateUrl: 'partials/global.html',
                controller: 'GlobalCtrl'
            });

        $routeProvider.
            when('/closed', {
                templateUrl: 'partials/closed.html',
                controller: 'ClosedCtrl'
            });

        $routeProvider.
            otherwise({
                redirectTo: '/'
            });
    }

]);