//console.log('Document source %j',document.documentElement.outerHTML); 

function getTextNodes(document_root) {
//console.log('Get source called');
    var html = '';

    var treewalker = document.createTreeWalker(document_root.body, NodeFilter.SHOW_TEXT,
        {
            acceptNode: function (node) {
                if (node.parentNode && node.parentNode.nodeName.toLowerCase() !== 'script' &&
                    node.parentNode.nodeName.toLowerCase() !== 'style'
                    && node.parentNode.nodeName.toLowerCase() !== 'noscript') {
                    return NodeFilter.FILTER_ACCEPT;
                }
                else
                    return NodeFilter.FILTER_SKIP;
            }
        }, false);

    while (treewalker.nextNode())
        html += ' ' + treewalker.currentNode.nodeValue;
    
  //  console.log(html);
    return html;

}

/*chrome.runtime.sendMessage({
    request: "getSource",
    source: getTextNodes(document)
});*/

chrome.runtime.sendMessage({
    request: "getSource",
    source: document.documentElement.outerHTML
});