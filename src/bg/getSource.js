/*function DOMtoString(document_root) {
 var html = '',
 node = document_root.firstChild;
 while (node) {
 switch (node.nodeType) {
 case Node.ELEMENT_NODE:
 html += node.outerHTML;
 break;
 case Node.TEXT_NODE:
 html += node.nodeValue;
 break;
 case Node.CDATA_SECTION_NODE:
 html += '<![CDATA[' + node.nodeValue + ']]>';
 break;
 case Node.COMMENT_NODE:
 html += '<!--' + node.nodeValue + '-->';
 break;
 case Node.DOCUMENT_TYPE_NODE:
 // (X)HTML documents are identified by public identifiers
 html += "<!DOCTYPE " + node.name + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '') + (!node.publicId && node.systemId ? ' SYSTEM' : '') + (node.systemId ? ' "' + node.systemId + '"' : '') + '>\n';
 break;
 }
 node = node.nextSibling;
 }
 return html;
 }

 chrome.runtime.sendMessage({
 request: "getSource",
 source: DOMtoString(document).replace(/<script.*>.*<\/script>/gi, " ")
 });*/

function getTextNodes(document_root) {

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

    while (treewalker.nextNode())  {
        html += ' ';
        html += treewalker.currentNode.nodeValue;
    }
    return html;

}

function insertButton(){

    /*var jq = document.createElement("script");
    jq.setAttribute('src','../../js/jquery/jquery.js');
    var  slidepanel = document.createElement('script');
    slidepanel.setAttribute('src','../../js/jquery/jquery.slidepanel.js' );


    var button = document.createElement("button");
    button.innerHTML = "Clickme";
    var width  = window.innerWidth -150
    var height = (window.innerHeight/2)-150;
    button.setAttribute('style','position:fixed;width:70;' +
        '-webkit-transform: rotate(-90deg);left:'+width + ';top:'+height);
    document.body.appendChild(button);*/
}
//insertButton();

chrome.runtime.sendMessage({
    request: "getSource",
    source: getTextNodes(document)
});


