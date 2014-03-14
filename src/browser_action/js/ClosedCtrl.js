'use strict';

pathfinder.controller('ClosedCtrl',

    function ClosedCtrl($scope, $location) {

        $scope.tabs = [
            {title: 'Tirasdasd',
                url: 'http://www.google.com',
                id: 1,
                totalpages: 5}   ,
            {title: 'Tirasdasd',
                url: 'http://www.google.com',
                id: 2,
                totalpages: 5},
            {title: 'Tirasdasd',
                url: 'http://www.google.com',
                id: 3,
                totalpages: 5},
            {title: 'Tirasdasd',
                url: 'http://www.google.com',
                id: 4,
                totalpages: 5}
        ];

        $scope.openTab = function(id){
            console.log("Id is "+ id);
        }

    });
