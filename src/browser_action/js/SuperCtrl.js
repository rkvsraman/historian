'use strict';

pathfinder.controller('SuperCtrl',

    function SuperCtrl($scope, $location) {

        $scope.saveTab = function () {
            console.log($location.url());

            if ($location.url() === '/' || $location.url() === '/?showDetails=true') {
                $scope.$broadcast('saveTab');
            }
            else {
                $location.url('/?showDetails=true');
            }

        }
    }
);