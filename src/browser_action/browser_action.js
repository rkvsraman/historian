'use strict';
var pathfinder = angular.module('Pathfinder', ['ngRoute']);

pathfinder.config(['$routeProvider',
    function ($routeProvider) {

        $routeProvider.
            when('/', {
                templateUrl: 'partials/cloud.html',
                controller: 'CloudCtrl'
            });

        $routeProvider.
            when('/current', {
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
            when('/saved', {
                templateUrl: 'partials/saved.html',
                controller: 'SavedCtrl'
            });

        $routeProvider.
            otherwise({
                redirectTo: '/'
            });
    }

]);
pathfinder.directive('toFocus', function ($timeout) {
    return function (scope, elem, attrs) {
        scope.$watch(attrs.toFocus, function (newval) {
            if (newval) {
                $timeout(function () {
                    elem[0].focus();
                }, 0, false);
            }
        });
    };
});