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
            otherwise({
                redirectTo: '/'
            });
    }

]);