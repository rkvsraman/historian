var tabs = {};
var browserGraph = {};
var current_tab = 0;

var initialTabsLoaded = false;
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


        chrome.tabs.update(message.tabId, {url: message.link, active: true}, function (tab) {

        });

        response({success: "true"});

    }

    if (message.request === 'browserGraph') {

        response(buildBrowserGraph());
        console.log("Send Browsergraph %j", browserGraph);
    }


    if (message.request === 'getAllTabs') {

        response(tabs);
    }

    if (message.request === 'getClosedTabs') {

        var closedTabs = [];
        for (var i in tabs) {
            if (tabs[i].closed)
                closedTabs.push(tabs[i]);

        }
        console.log("Closed tabs %j ", closedTabs);
        response(closedTabs);

    }

    if (message.request === 'reopenTab') {

        tabId = message.tabId;

        if (tabs[tabId].closed) {

            chrome.tabs.create({active: true, url: tabs[tabId].lastURL}, function (tab) {
                tabs[tab.id] = tabs[tabId];
                tabs[tab.id].graph.forEachNode(function (nodeObject, nodeid) {
                    nodeObject.tabId = tab.id;
                });
                tabs[tab.id].id = tab.id;
                tabs[tab.id].closed = false;
                delete   tabs[tabId];
            });

        }
        response({status: true});
    }

    if (message.request === 'deleteTab') {

        tabId = message.tabId;
        closeTab(tabId);
        delete  tabs[tabId];
        response({status: true});
        console.log("Sent response")
    }


});

function createNewTab(tab) {

    if (tabs[tab.id]) {
        return;
    }
    console.log("Now:" + new Date());
    var tabUrl = tab.url;

    if (tabUrl.indexOf('chrome-devtools') != -1) {
        return;
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

    tabInfo.firstURL = tabUrl;
    tabInfo.prevURL = browserGraph.lastURL;


    var node = tabInfo.graph.addNode(tabUrl);
    node.title = tab.title;
    node.tabId = tab.id;
    node.winId = tab.windowId;
    tabInfo.lastURL = tabUrl;
    tabInfo.lastTitle = tab.title;


    if (tabUrl.indexOf('chrome://newtab') != -1) {
        browserGraph.lastURL = tabUrl;
    }
}

function buildBrowserGraph() {
    browserGraph.graph = new Graph();

    for (var tab in tabs) {
        if (!tabs[tab].closed) {
            var thisTab = tabs[tab];

            thisTab.graph.forEachNode(function (nodeObject, nodeid) {
                var thisNode = browserGraph.graph.getNode(nodeid);
                if (!thisNode) {
                    thisNode = browserGraph.graph.addNode(nodeid);
                    thisNode.title = nodeObject.title;
                    thisNode.tabId = thisTab.id;
                    thisNode.winId = thisTab.winId;
                }
            });
        }
    }

    for (var tab in tabs) {
        if (!tabs[tab].closed) {
            var thisTab = tabs[tab];
            thisTab.graph.forEachNode(function (nodeObject, nodeid) {
                var outNodes = nodeObject._outEdges;
                for (outNode in outNodes) {
                    if (outNode.indexOf("chrome://newtab") == -1)
                        browserGraph.graph.addEdge(nodeid, outNode);
                }
            });
        }
    }

    for (var tab in tabs) {
        if (!tabs[tab].closed) {
            if (tabs[tab].prevURL && tabs[tab].firstURL) {
                var fURL = tabs[tab].prevURL;
                var lURL = tabs[tab].firstURL;
                var fNode = browserGraph.graph.getNode(fURL);
                var lNode = browserGraph.graph.getNode(lURL);

                if (fNode && lNode &&
                    fURL.indexOf("chrome://newtab") == -1 &&
                    lURL.indexOf("chrome://newtab") == -1 ) {
                    browserGraph.graph.addEdge(fURL,lURL);

                }

            }
        }
    }

    return browserGraph;
}

chrome.tabs.onCreated.addListener(function (tab) {

    createNewTab(tab);


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

    if (changeinfo.status === 'loading') {
        var tabInfo = tabs[tabID];
        if (tabInfo) {
            console.log("Tab id:" + tabID + " last_url:" + tabInfo.lastURL);
            if (tabInfo.lastURL != tabUrl) {

                var sourceNode = tabInfo.graph.getNode(tabInfo.lastURL);
                var destNode = tabInfo.graph.getNode(tabUrl);


                if (!destNode) {
                    destNode = tabInfo.graph.addNode(tabUrl);
                    destNode.title = tab.title;
                    destNode.tabId = tab.id;
                    destNode.winId = tab.windowId;
                }


                if (sourceNode && destNode) {
                    tabInfo.graph.addEdge(tabInfo.lastURL, tabUrl);
                }


                tabInfo.lastURL = tabUrl;
                tabInfo.lastTitle = tab.title;
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

            if (destNode) {
                destNode.title = tab.title;
                tabInfo.lastTitle = tab.title
            }
        }
        else {
            console.log("No tab info found for id:" + tabID);
        }
    }

});

chrome.tabs.onActivated.addListener(function (activeInfo) {

    setLastUrl('Activated', activeInfo.tabId);

});

chrome.tabs.onDetached.addListener(function (tabId, detachInfo) {

    setLastUrl('Detached', tabId);
});


chrome.tabs.onAttached.addListener(function (tabId, attachInfo) {

    setLastUrl('Attached', tabId);
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {

    closeTab(tabId);
});

function closeTab(tabId) {
    console.log("Now:" + new Date());

    console.log("Closing tab:" + tabId);
    var tabInfo = tabs[tabId];
    if (tabInfo) {
        tabInfo.closed = true;
    }
    else {
        console.log("Tab was not found in Tabinfo");
    }
}

function loadInitialtabs() {
    if (initialTabsLoaded)
        return;
    chrome.tabs.query({}, function (tabs) {

        for (var i = 0; i < tabs.length; i++) {

            createNewTab(tabs[i]);
        }
        initialTabsLoaded = true;

    });

}

function setLastUrl(message, tabId) {

    console.log("Now:" + new Date());

    current_tab = tabId;
    if (tabs[current_tab]) {
        console.log(message + " " + tabId + " " + tabs[current_tab].lastURL);
        browserGraph.lastURL = tabs[current_tab].lastURL;
    }
}
loadInitialtabs();