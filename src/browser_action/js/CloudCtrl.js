'use strict';

pathfinder.controller('CloudCtrl',

    function CloudCtrl($scope, $location) {

        $scope.tabs = [];
        $scope.no_tabs = false;

        function getWordCloud() {
            $scope.no_tabs = false;

            chrome.runtime.sendMessage({request: 'getSavedTabs'}, function (response) {


            });
        }

        $scope.openTab = function (id) {
            chrome.runtime.sendMessage({request: 'openSavedTab', id: id}, function (response) {
            });

        }

        $scope.deleteTab = function (id) {
            chrome.runtime.sendMessage({request: 'deleteSavedTab', id: id}, function (response) {

                getSavedTabs();
            });

        }
        chrome.runtime.onMessage.addListener(function (message, sender, response) {
            if (message.request === 'savedTabresults') {

                $scope.$apply(function () {
                    $scope.tabs = message.results;
                    if(message.results.length == 0)
                        $scope.no_tabs = true;
                });
                response({success: true});
            }
        });
        getSavedTabs();

    });
