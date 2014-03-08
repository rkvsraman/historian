'use strict';

pathfinder.controller('WelcomeCtrl',

    function WelcomeCtrl($scope, $location) {
        $scope.clicked = function () {
            alert("Clicked");
        };
    }
);