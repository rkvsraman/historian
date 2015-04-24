'use strict';

pathfinder.controller('SavedCtrl',

    function SavedCtrl($scope, $location) {

        $scope.tabs = [];
        $scope.no_tabs = false;

        function getSavedTabs() {
            $scope.no_tabs = false;

            chrome.runtime.sendMessage({
                request: 'getSavedTabs'
            }, function (response) {


            });
        }

        $scope.openTab = function (id) {
            chrome.runtime.sendMessage({
                request: 'openSavedTab',
                id: id
            }, function (response) {});

        }

        $scope.deleteTab = function (id) {
            chrome.runtime.sendMessage({
                request: 'deleteSavedTab',
                id: id
            }, function (response) {

                getSavedTabs();
            });

        }
        chrome.runtime.onMessage.addListener(function (message, sender, response) {
            if (message.request === 'savedTabresults') {

                $scope.$apply(function () {

                    $scope.tabs = [];
                    if (message.results.length == 0) {
                        $scope.no_tabs = true;
                        return;
                    } else {

                        var responses = message.results;
                        for (var i = 0; i < responses.length; i++) {

                            var tab = {};
                            tab.id = responses[i].id;
                            tab.note = responses[i].note;
                            tab.creation_time = responses[i].creation_time;
                            tab.tags = ['No labels'];
                            if(responses[i].tags){
                                tab.tags = responses[i].tags.split(",");
                                if(tab.tags == "undefined"){
                                    tab.tags = ['No labels'];
                                }
                                    
                            }
                            tab.no_of_pages = responses[i].no_of_pages;
                            tab.s_pages = [];
                            if (responses[i].nodes && responses[i].nodes.graph && responses[i].nodes.graph._nodes) {
                                var nodes = responses[i].nodes.graph._nodes;
                                for (var node in nodes) {
                                    var page = {};
                                    page.link = node;
                                    page.title = nodes[node].title;
                                    tab.s_pages.push(page);

                                }
                            }
                            $scope.tabs.push(tab);
                        }
                    }
                    // $scope.tabs = message.results;
                    console.log('Saved Tabs %j', $scope.tabs);

                });
                response({
                    success: true
                });
            }
        });
        getSavedTabs();

    });