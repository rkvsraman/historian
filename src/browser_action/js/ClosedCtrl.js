'use strict';

pathfinder.controller('ClosedCtrl',

    function ClosedCtrl($scope, $location) {

        $scope.tabs = [];
        $scope.no_tabs = false;

        function getClosedTabs() {
            chrome.runtime.sendMessage({request: 'getClosedTabs'}, function (response) {

                $scope.$apply(function () {
                    $scope.tabs = [];
                    if (response.error) {
                        $scope.no_tabs = true;

                    }
                    else {
                        if (response.length > 0) {
                            for (var i = 0; i < response.length; i++) {
                                var tab = {};
                                tab.title = response[i].lastTitle;
                                tab.url = response[i].lastURL;
                                tab.id = response[i].id;
                                tab.totalpages = response[i].graph.nodeSize;
                                $scope.tabs.push(tab);

                            }
                        }
                        else {
                            $scope.no_tabs = true;
                        }
                    }

                });

            });
        }


        $scope.openTab = function (id) {
            chrome.runtime.sendMessage({request: 'reopenTab', tabId: id}, function (response) {
            });

        }

        $scope.deleteTab = function(id){
            chrome.runtime.sendMessage({request: 'deleteTab', tabId: id}, function (response) {

                  console.log("deleteTab succeeded")
                  getClosedTabs();
            });
        }

        getClosedTabs();

    });
