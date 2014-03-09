var tabs = {};
var Graph = require('data-structures').Graph;


var current_tab = 0;
chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {

    });

chrome.runtime.onMessage.addListener(function (message, sender, response) {


    if (message.request === 'getTabInfo') {
        response(tabs[current_tab]);

    }
    if (message.request === 'openLink') {
        chrome.tabs.update(message.tabId, {url: message.link}, function () {
            response({success: true});
        });
    }
});

chrome.tabs.onCreated.addListener(function (tab) {

    if (tab.url.indexOf('chrome-devtools') != -1) {
        return;
    }


    var tabInfo = {};
    tabInfo.id = tab.id;
    tabInfo.graph = new Graph();

    var node = tabInfo.graph.addNode(tab.url);
    node.title = tab.title;
    tabInfo.lastURL = tab.url;
    tabs[tab.id] = tabInfo;
    current_tab = tab.id;


});

chrome.tabs.onUpdated.addListener(function (tabID, changeinfo, tab) {


    if (tab.url.indexOf('chrome-devtools') != -1) {
        return;
    }
    if (changeinfo.status === 'loading') {
        var tabInfo = tabs[tabID];
        if (tabInfo.lastURL != tab.url) {

            var sourceNode = tabInfo.graph.getNode(tabInfo.lastURL);
            var destNode = tabInfo.graph.getNode(tab.url);

            if (!destNode) {
                destNode = tabInfo.graph.addNode(tab.url);
                destNode.title = tab.title;
            }
            if (sourceNode && destNode) {
                tabInfo.graph.addEdge(tabInfo.lastURL, tab.url);
            }

            tabInfo.lastURL = tab.url;

        }
    }
    if (changeinfo.status === 'complete') {
        var tabInfo = tabs[tabID];
        var destNode = tabInfo.graph.getNode(tab.url);
        if (destNode) {
            destNode.title = tab.title;
        }


    }

});

chrome.tabs.onActivated.addListener(function (activeInfo) {


    console.log("Activated " + activeInfo.tabId);
    current_tab = activeInfo.tabId;
});
chrome.tabs.onDetached.addListener(function (tabId, detachInfo) {


    console.log("Detached " + tabId);
    current_tab = tabId;
});

chrome.tabs.onAttached.addListener(function (tabId, attachInfo) {


    console.log("Attached " + tabId);
    current_tab = tabId;
});