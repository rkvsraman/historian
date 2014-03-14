'use strict';

pathfinder.controller('ClosedCtrl',

    function ClosedCtrl($scope, $location) {

        $scope.tabs = [];

        function getClosedTabs() {
            chrome.runtime.sendMessage({request: 'getClosedTabs'}, function (response) {

                $scope.$apply(function () {
                    if (response.error) {
                        $scope.title = "No information available for this tab";

                    }
                    else {
                        for (var i = 0; i < response.length; i++) {
                            var tab = {};
                            tab.title = response[i].lastTitle;
                            tab.url = response[i].lastURL;
                            tab.id = response[i].id;
                            tab.totalpages = response[i].graph.nodeSize;
                            $scope.tabs.push(tab);

                        }
                    }

                });

            });
        }


        $scope.openTab = function (id) {
            chrome.runtime.sendMessage({request: 'reopenTab',tabId:id}, function (response) {
            });

        }

        getClosedTabs();

    });
