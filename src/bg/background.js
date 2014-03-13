var tabs = {};
var browserGraph = {};
var current_tab = 0;
var zoomlevel = 1;
var Graph = require('data-structures').Graph;


chrome.runtime.onMessage.addListener(function (message, sender, response) {


    console.log("Now:" + new Date());
    console.log("Message %j", message);
    if (message.request === 'getTabInfo') {
        var tabInfo = tabs[current_tab];
        if (tabInfo) {
            console.log("Sending tab info for id:" + current_tab);
            console.log("%j", tabInfo);
            response(tabInfo);
        }
        else {
            response({error: "No tab information"});
        }

    }
    if (message.request === 'openLink') {

        var node = browserGraph.graph.getNode(message.link);
        console.log("Opening node %j", node);
        for (var i = 0; i < node.inTabs.length; i++) {
            if (tabs[node.inTabs[i]] && !tabs[node.inTabs[i]].closed) {
                console.log("Opening in tab:" + node.inTabs[i]);
                chrome.tabs.update(node.inTabs[i], {url: message.link, active: true}, function (tab) {

                });
                break;
            }
        }

        response({success: "true"});

    }

    if (message.request === 'browserGraph') {
        console.log("Send Browsergraph %j", browserGraph);
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

    console.log("Now:" + new Date());
    var tabUrl = tab.url;

    if (tabUrl.indexOf('chrome-devtools') != -1) {
        return;
    }

    if (!browserGraph.graph) {
        browserGraph.graph = new Graph();
        browserGraph.lastURL = '';
    }

    if (tabUrl.indexOf('chrome://newtab') != -1) {
        tabUrl = tabUrl + " " + tab.id;
    }
    console.log("On create id:" + tab.id + " url:" + tabUrl + " last:" + browserGraph.lastURL);


    var tabInfo = {};
    tabInfo.id = tab.id;
    tabInfo.graph = new Graph();
    tabs[tab.id] = tabInfo;
    tabInfo.lastURL = 'emptyurl';
    if (!tab.url) {
        console.log("Found empty url... returning");
        return;
    }


    var node = tabInfo.graph.addNode(tabUrl);
    node.title = tab.title;
    node.tabId = tab.id;
    node.winId = tab.windowId;
    tabInfo.lastURL = tabUrl;


    var gNode = browserGraph.graph.getNode(tabUrl);
    if (!gNode) {
        gNode = browserGraph.graph.addNode(tabUrl);
        gNode.title = tab.title;
        gNode.tabId = tab.id;
        gNode.winId = tab.windowId;
        gNode.closed = false;
        gNode.inTabs = [];
        gNode.inTabs.push(tab.id);


    }
    else {
        if (gNode.inTabs.indexOf(tab.id) == -1) {
            gNode.inTabs.push(tab.id);
        }
    }

    var gSourceNode = browserGraph.graph.getNode(browserGraph.lastURL);
    if (gSourceNode && gNode && tabUrl.indexOf("chrome://newtab") == -1) {
        browserGraph.graph.addEdge(browserGraph.lastURL, tabUrl);
    }

    browserGraph.lastURL = tabUrl;


});

chrome.tabs.onUpdated.addListener(function (tabID, changeinfo, tab) {

    console.log("Now:" + new Date());

    var tabUrl = tab.url;

    if (tabUrl.indexOf('chrome-devtools') != -1) {
        return;
    }
    if (tabUrl.indexOf('chrome://newtab') != -1) {
        return;
    }
    console.log("On update status:" + changeinfo.status + "  id:" + tab.id + " url:" + tabUrl + " last:" + browserGraph.lastURL);
    if (!tab.url) {
        console.log("Found empty url... returning");
        return;
    }
    //console.log("Tabs %j", tabs);
    //console.log("Browser %j", browserGraph);
    if (changeinfo.status === 'loading') {
        var tabInfo = tabs[tabID];
        if (tabInfo) {
            console.log("Tab id:" + tabID + " last_url:" + tabInfo.lastURL);
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
                    gDestNode.inTabs = [];
                    gDestNode.inTabs.push(tab.id);
                }
                else {
                    if (gDestNode.inTabs.indexOf(tab.id) == -1) {
                        gDestNode.inTabs.push(tab.id);
                    }
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
            else {
                console.log("Same urls ... skipping");
            }

        }
        else {
            console.log("No tab info found for id:" + tabID);
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
        else {
            console.log("No tab info found for id:" + tabID);
        }
    }

});

chrome.tabs.onActivated.addListener(function (activeInfo) {

    console.log("Now:" + new Date());

    current_tab = activeInfo.tabId;
    if (tabs[current_tab]) {
        console.log("Activated " + activeInfo.tabId + " " + tabs[current_tab].lastURL);
        browserGraph.lastURL = tabs[current_tab].lastURL;
    }
});
chrome.tabs.onDetached.addListener(function (tabId, detachInfo) {

    console.log("Now:" + new Date());

    current_tab = tabId;
    if (tabs[current_tab]) {
        console.log("Detached " + tabId + " " + tabs[current_tab].lastURL);
        browserGraph.lastURL = tabs[current_tab].lastURL;
    }
});

chrome.tabs.onAttached.addListener(function (tabId, attachInfo) {

    console.log("Now:" + new Date());
    current_tab = tabId;
    if (tabs[current_tab]) {
        console.log("Attached " + tabId + " " + tabs[current_tab].lastURL);
        browserGraph.lastURL = tabs[current_tab].lastURL;
    }
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    console.log("Now:" + new Date());

    console.log("Closing tab:" + tabId);
    var tabInfo = tabs[tabId];
    if (tabInfo) {
        tabInfo.closed = true;
        tabInfo.graph.forEachNode(function (nodeObject, nodeid) {
            var closedNode = browserGraph.graph.getNode(nodeid);
            if (closedNode.inTabs.length > 1) {
                var index = closedNode.inTabs.indexOf(tabId);
                if (index > -1) {
                    closedNode.inTabs.splice(index, 1);
                }
            }
            else {
                browserGraph.graph.removeNode(nodeid);
            }

        });
    }
    else {
        console.log("Tab was not foung in Tabinfo");
    }

});