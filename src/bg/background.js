var tabs = {};
var browserGraph = {};

var current_tab = 0;
var Graph = require('data-structures').Graph;


chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {

    });

chrome.runtime.onMessage.addListener(function (message, sender, response) {


    if (message.request === 'getTabInfo') {
        response(tabs[current_tab]);

    }
    if (message.request === 'openLink') {

        chrome.tabs.update(message.tabId, {url: message.link, active: true}, function (tab) {
            console.log("Sending response");

        });

        response({success: "true"});

    }

    if (message.request === 'browserGraph') {
        response(browserGraph);
    }
});

chrome.tabs.onCreated.addListener(function (tab) {

    if (tab.url.indexOf('chrome-devtools') != -1) {
        return;
    }

    if (!browserGraph.graph) {
        browserGraph.graph = new Graph();
        browserGraph.lastURL = '';
    }


    var tabInfo = {};
    tabInfo.id = tab.id;
    tabInfo.graph = new Graph();
    tabs[tab.id] = tabInfo;
    current_tab = tab.id;

    if (tab.url.indexOf('chrome://newtab') != -1) {
        tabInfo.lastURL ='';
        browserGraph.lastURL = ''
        console.log("Returning");
        return;
    }
    var node = tabInfo.graph.addNode(tab.url);
    node.title = tab.title;
    node.tabId = tab.id;
    node.winId = tab.windowId;
    tabInfo.lastURL = tab.url;

    console.log(" Browser last URL " + browserGraph.lastURL);
    var gNode = browserGraph.graph.getNode(tab.url);
    if (!gNode) {
        gNode = browserGraph.graph.addNode(tab.url);
        gNode.title = tab.title;
        gNode.tabId = tab.id;
        gNode.winId = tab.windowId;
        var gSourceNode = browserGraph.graph.getNode(browserGraph.lastURL);
        if (gSourceNode && gNode) {
            browserGraph.graph.addEdge(browserGraph.lastURL, tab.url);
        }

    }
    browserGraph.lastURL = tab.url;


});

chrome.tabs.onUpdated.addListener(function (tabID, changeinfo, tab) {


    if (tab.url.indexOf('chrome-devtools') != -1) {
        return;
    }
    if (tab.url.indexOf('chrome://newtab') != -1) {
        return;
    }
    console.log("Tab id  " + tabID);
    console.log("Tabs %j", tabs);
    console.log("Browser %j", browserGraph);
    if (changeinfo.status === 'loading') {
        var tabInfo = tabs[tabID];
        if (tabInfo.lastURL != tab.url) {

            var sourceNode = tabInfo.graph.getNode(tabInfo.lastURL);
            var destNode = tabInfo.graph.getNode(tab.url);
            var gSourceNode = browserGraph.graph.getNode(browserGraph.lastURL);
            var gDestNode = browserGraph.graph.getNode(tab.url);

            if (!destNode) {
                destNode = tabInfo.graph.addNode(tab.url);
                destNode.title = tab.title;
                destNode.tabId = tab.id;
                destNode.winId = tab.windowId;
            }

            if (!gDestNode) {
                gDestNode = browserGraph.graph.addNode(tab.url);
                gDestNode.title = tab.title;
                gDestNode.tabId = tab.id;
                gDestNode.winId = tab.windowId;
            }


            if (sourceNode && destNode) {
                tabInfo.graph.addEdge(tabInfo.lastURL, tab.url);
            }

            if (gSourceNode && gDestNode) {
                browserGraph.graph.addEdge(browserGraph.lastURL, tab.url);
            }

            tabInfo.lastURL = tab.url;
            browserGraph.lastURL = tab.url;

        }
    }
    if (changeinfo.status === 'complete') {
        var tabInfo = tabs[tabID];
        var destNode = tabInfo.graph.getNode(tab.url);
        var gDestNode = browserGraph.graph.getNode(tab.url);
        if (destNode) {
            destNode.title = tab.title;
        }
        if (gDestNode) {
            gDestNode.title = tab.title;
        }
    }

});

chrome.tabs.onActivated.addListener(function (activeInfo) {


    current_tab = activeInfo.tabId;
    if (tabs[current_tab]) {
        console.log("Activated " + activeInfo.tabId + " " + tabs[current_tab].lastURL);
        browserGraph.lastURL = tabs[current_tab].lastURL;
    }
});
chrome.tabs.onDetached.addListener(function (tabId, detachInfo) {


    current_tab = tabId;
    if (tabs[current_tab]) {
        console.log("Detached " + tabId + " " + tabs[current_tab].lastURL);
        browserGraph.lastURL = tabs[current_tab].lastURL;
    }
});

chrome.tabs.onAttached.addListener(function (tabId, attachInfo) {


    current_tab = tabId;
    if (tabs[current_tab]) {
        console.log("Attached " + tabId + " " + tabs[current_tab].lastURL);
        browserGraph.lastURL = tabs[current_tab].lastURL;
    }
});