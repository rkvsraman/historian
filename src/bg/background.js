var tabs = {};
var browserGraph = {};

var current_tab = 0;
var zoomlevel = 1;
var Graph = require('data-structures').Graph;


/*chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {

    });  */

chrome.runtime.onMessage.addListener(function (message, sender, response) {


    if (message.request === 'getTabInfo') {
        var tabInfo = tabs[current_tab];
        if (tabInfo) {
            response(tabInfo);
        }
        else {
            response({error: "No tab information"});
        }

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

    if (message.request === 'setZoomLevel') {
        zoomlevel = message.zoomlevel;
        response({success: "true"});
    }
    if (message.request === 'getZoomLevel') {

        response({zoomlevel: zoomlevel});
    }
    if (message.request === 'getAllTabs') {

        response(tabs);
    }

    if (message.request === 'createSession') {

        response(tabs);
    }


});

chrome.tabs.onCreated.addListener(function (tab) {

    var tabUrl = tab.url;
    if (tabUrl.indexOf('chrome-devtools') != -1) {
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

    if (tabUrl.indexOf('chrome://newtab') != -1) {
        tabUrl = tabUrl + " " + tab.id;
    }
    var node = tabInfo.graph.addNode(tabUrl);
    node.title = tab.title;
    node.tabId = tab.id;
    node.winId = tab.windowId;
    tabInfo.lastURL = tabUrl;

    console.log(" Browser last URL " + browserGraph.lastURL);
    var gNode = browserGraph.graph.getNode(tabUrl);
    if (!gNode) {
        gNode = browserGraph.graph.addNode(tabUrl);
        gNode.title = tab.title;
        gNode.tabId = tab.id;
        gNode.winId = tab.windowId;
        gNode.closed = false;
        var gSourceNode = browserGraph.graph.getNode(browserGraph.lastURL);
        if (gSourceNode && gNode && tabUrl.indexOf("chrome://newtab") == -1) {
            browserGraph.graph.addEdge(browserGraph.lastURL, tabUrl);
        }

    }
    browserGraph.lastURL = tabUrl;


});

chrome.tabs.onUpdated.addListener(function (tabID, changeinfo, tab) {


    var tabUrl = tab.url;

    if (tabUrl.indexOf('chrome-devtools') != -1) {
        return;
    }
    if (tabUrl.indexOf('chrome://newtab') != -1) {
        tabUrl = tabUrl + " " + tab.id;
    }
    console.log("Tab id  " + tabID);
    console.log("Tabs %j", tabs);
    console.log("Browser %j", browserGraph);
    if (changeinfo.status === 'loading') {
        var tabInfo = tabs[tabID];
        if (tabInfo) {
            if (tabInfo.lastURL != tabUrl) {

                var sourceNode = tabInfo.graph.getNode(tabInfo.lastURL);
                var destNode = tabInfo.graph.getNode(tabUrl);
                var gSourceNode = browserGraph.graph.getNode(browserGraph.lastURL);
                var gDestNode = browserGraph.graph.getNode(tabUrl);

                if (!destNode) {
                    destNode = tabInfo.graph.addNode(tabUrl);
                    destNode.title = tab.title;
                    destNode.tabId = tab.id;
                    destNode.winId = tab.windowId;
                }

                if (!gDestNode) {
                    gDestNode = browserGraph.graph.addNode(tabUrl);
                    gDestNode.title = tab.title;
                    gDestNode.tabId = tab.id;
                    gDestNode.winId = tab.windowId;
                    gDestNode.closed = false;
                }


                if (sourceNode && destNode) {
                    tabInfo.graph.addEdge(tabInfo.lastURL, tabUrl);
                }

                if (gSourceNode && gDestNode && tabUrl.indexOf("chrome://newtab") == -1) {
                    browserGraph.graph.addEdge(browserGraph.lastURL, tabUrl);
                }

                tabInfo.lastURL = tabUrl;
                browserGraph.lastURL = tabUrl;

            }
        }
    }
    if (changeinfo.status === 'complete') {
        var tabInfo = tabs[tabID];
        if (tabInfo) {
            var destNode = tabInfo.graph.getNode(tabUrl);
            var gDestNode = browserGraph.graph.getNode(tabUrl);
            if (destNode) {
                destNode.title = tab.title;
            }
            if (gDestNode) {
                gDestNode.title = tab.title;
            }
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

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {


    var tabInfo = tabs[tabId];
    if (tabInfo) {
        tabInfo.closed = true;
        tabInfo.graph.forEachNode(function(nodeObject, nodeid){
            var closedNode = browserGraph.graph.getNode(nodeid);
            if(closedNode){
                closedNode.closed = true;
            }

        }) ;
    }

});