var tabs = {};
var browserGraph = {};
var current_tab = 0;
var db;

var initialTabsLoaded = false;
var Graph = require('data-structures').Graph;


chrome.runtime.onMessage.addListener(function (message, sender, response) {


    console.log("Now:" + new Date());
    console.log("Message %j Sender %j", message, sender);
    if (message.request === 'getTabInfo') {

        sendTabInfo(response);

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
    if (message.request === 'deleteSavedTab') {
        var id = message.id;
        deleteSavedTab(id);
        response({success: true});
    }
    if (message.request === 'getSource') {
        console.log(jQuery(message.source).text());
    }

    if (message.request === 'saveTab') {

        saveTab(message.tabId, message.note, message.tags);
        response({success: true});
    }

    if (message.request === 'getSavedTabs') {

        getSavedTabs(response);
    }

    if (message.request === 'openSavedTab') {

        var id = message.id;

        openSavedTab(id);
    }


});


function sendTabInfo(response) {


    if (tabs[current_tab]) {
        var tabInfo = getTabInfo(tabs[current_tab]);
        response(tabInfo);
    }
    else {
        response({error: "No tab information!!"});
    }
}

function getTabInfo(currTab) {

    var tabInfo = currTab;

    for (var tab in tabs) {
        if (tabs[tab].id != tabInfo.id && !tabs[tab].closed &&
            tabs[tab].prevURL &&
            tabInfo.graph.getNode(tabs[tab].prevURL)) {
            tabInfo = mergeGraphs(tabInfo, tabs[tab]);
        }
    }

    return tabInfo;

}


function mergeGraphs(tab1, tab2) {

    var tabInfo = {};              // Set up basic object
    tabInfo.id = tab1.id;
    tabInfo.graph = new Graph();
    tabInfo.graph._nodes = tab1.graph._nodes;
    tabInfo.lastURL = tab1.lastURL;
    tabInfo.prevURL = tab1.prevURL;
    tabInfo.graph.nodeSize = tab1.graph.nodeSize;
    tabInfo.graph.edgeSize = tab1.graph.edgeSize;
    tabInfo.firstURL = tab1.firstURL
    tabInfo.lastTitle = tab1.lastTitle;


    var tab3 = getTabInfo(tab2);   // Recursing for each other tab's children


    tab3.graph.forEachNode(function (node, id) {       // Add each node to parent graph
        if (!tabInfo.graph.getNode(id)) {
            var newnode = tabInfo.graph.addNode(id);
            newnode.title = node.title;
            newnode.tabId = tab1.id;
        }
    });


    tabInfo.graph.addEdge(tab3.prevURL, tab3.firstURL); // Link parent graph and chile graph


    tab3.graph.forEachNode(function (node, id) { // Set up edges of the child graph in parent graph

        console.log(" Looking for " + id);
        var newnode = tabInfo.graph.getNode(id);
        if (newnode) {
            console.log("New node was found")
            for (var outNode in node._outEdges) {
                console.log("OutEdge " + outNode);
                tabInfo.graph.addEdge(id, outNode);
            }
        }
    });

    return tabInfo;
}

function deleteSavedTab(id) {

    function populateDB(tx) {
        tx.executeSql('DELETE FROM pathfinder WHERE id=?', [id], function (tx, results) {

            return false;
        }, function (err) {
            console.log("Error %j", err);
            return false;
        });
    }

    db.transaction(populateDB, function (tx, err) {
        console.log("%j %j", tx, err);
        return false;
    }, function () {
        console.log("Rows returned");
        return false;
    });

}

function openSavedTab(id) {

    function populateDB(tx) {
        tx.executeSql('SELECT  graphData FROM pathfinder WHERE id=?', [id], function (tx, results) {

            if (results.rows.length >= 1) {
                var thisGraph = JSON.parse(results.rows.item(0).graphData);
                console.log('Graphdata %j', thisGraph);
                var tabInfo = {};
                tabInfo.id = thisGraph.id;
                tabInfo.graph = new Graph();
                tabInfo.graph._nodes = thisGraph.graph._nodes;
                tabInfo.lastURL = thisGraph.lastURL;
                tabInfo.prevURL = thisGraph.prevURL;
                tabInfo.graph.nodeSize = thisGraph.graph.nodeSize;
                tabInfo.graph.edgeSize = thisGraph.graph.edgeSize;
                tabInfo.firstURL = thisGraph.firstURL
                tabInfo.lastTitle = thisGraph.lastTitle;
                console.log('Constructed graph %j', tabInfo);

                chrome.tabs.create({active: true, url: tabInfo.lastURL}, function (tab) {
                    tabs[tab.id] = tabInfo;
                    tabs[tab.id].graph.forEachNode(function (nodeObject, nodeid) {
                        nodeObject.tabId = tab.id;
                    });
                    tabs[tab.id].id = tab.id;
                    tabs[tab.id].closed = false;

                });
            }
            return false;
        }, function (err) {
            console.log("Error %j", err);
            return false;
        });
    }

    db.transaction(populateDB, function (tx, err) {
        console.log("%j %j", tx, err);
        return false;
    }, function () {
        console.log("Rows returned");
        return false;
    });

}

function saveTab(tabId, note, tags) {

    if (tabs[tabId]) {

        var tabInfo = getTabInfo(tabs[tabId]);

        function populateDB(tx) {
            tx.executeSql('INSERT INTO pathfinder (graphData, note,tags,created_time,no_of_pages) VALUES (?,?,?,?,?)',
                [ JSON.stringify(tabInfo), note , tags, new Date(), tabInfo.graph.nodeSize]);
        }

        db.transaction(populateDB, function (tx, err) {
            console.log("%j %j", tx, err);
        }, function () {
            console.log("Inserted");
        });

    }
}

function getSavedTabs(response) {


    function populateDB(tx) {
        tx.executeSql('SELECT  id,note,tags,created_time,no_of_pages FROM pathfinder', [], function (tx, results) {

            var qResults = [];
            for (var i = 0; i < results.rows.length; i++) {
                var resultitem = {};
                resultitem.id = results.rows.item(i).id;
                resultitem.note = results.rows.item(i).note;
                resultitem.tags = results.rows.item(i).tags;
                resultitem.created_time = new Date(results.rows.item(i).created_time).toLocaleDateString();
                resultitem.no_of_pages = results.rows.item(i).no_of_pages;
                qResults.push(resultitem);
            }

            chrome.runtime.sendMessage({request: 'savedTabresults', results: qResults},
                function (response) {
                });

            console.log("Returned results");
            return false;
        }, function (err) {
            console.log("Error %j", err);
            return false;
        });
    }

    db.transaction(populateDB, function (tx, err) {
        console.log("%j %j", tx, err);
        return false;
    }, function () {
        console.log("Rows returned");
        return false;
    });

}

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
                    lURL.indexOf("chrome://newtab") == -1) {
                    browserGraph.graph.addEdge(fURL, lURL);

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

            /* chrome.tabs.executeScript(tabID, {
             file: "src/bg/getSource.js"
             }, function () {
             if (chrome.extension.lastError) {
             console.log("Count not insert script %j", chrome.extension.lastError);
             }
             }); */
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


function openDB() {

    db = openDatabase('pathfinder_db', '1.0', 'Pathfinder DB', 10 * 1024 * 1024);
    function populateDB(tx) {
        //  tx.executeSql('DROP TABLE  pathfinder');
        tx.executeSql('CREATE TABLE IF NOT EXISTS pathfinder (id INTEGER PRIMARY KEY AUTOINCREMENT,graphData,note,tags,created_time,no_of_pages)');
    }

    db.transaction(populateDB, function (tx, err) {
        console.log("%j %j", tx, err);
    }, function () {
        console.log("Table created");
    });


}

openDB();
loadInitialtabs();