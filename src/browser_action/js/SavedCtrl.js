'use strict';

pathfinder.controller('SavedCtrl',

    function SavedCtrl($scope, $location) {

        $scope.tabs = [];
        $scope.no_tabs = false;

        function getSavedTabs() {
            $scope.no_tabs = false;

            chrome.runtime.sendMessage({request: 'getSavedTabs'}, function (response) {


            });
        }

        $scope.openTab = function (id) {
            chrome.runtime.sendMessage({request: 'openSavedTab', id: id}, function (response) {
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