

var tabs = {};
var Graph = require("data-structures").Graph;


var current_tab = 0;
chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {
        chrome.pageAction.show(sender.tab.id);
        sendResponse();
    });

chrome.tabs.onCreated.addListener(function (tab) {

    console.log("Created " + tab.id + " " + tab.url);
    var tabInfo = {};
    tabInfo.id = tabID;
    tabInfo.graph = new Graph();
    tabInfo.graph.addNode(tab.url);
    tabInfo.lastURL = tab.url;
    tabs[tabID] = tabInfo;


});

chrome.tabs.onUpdated.addListener(function (tabID, changeinfo, tab) {

    console.log("Changed " + tabID + " \n" + tab.url + "\n "
        + changeinfo.url
        + "\n"
        + changeinfo.status);
    if (changeinfo.status === 'loading') {
        var tabInfo = tabs[tabID];
        if(tabInfo.lastURL != tab.url){
            var node1 = tabInfo.graph.getNode(tabInfo.lastURL);
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