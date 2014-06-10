function insertButton() {

  
    var button = document.createElement('button');
    button.setAttribute('class', 'toolfixed');

    var bImg = document.createElement('img');
    bImg.setAttribute('src', chrome.extension.getURL('icons/icon16.png'));
    button.appendChild(bImg);

    document.body.appendChild(button);
}

function loadScriptsAndCSS() {

    var jqcss = document.createElement('link');
    jqcss.setAttribute('href', chrome.extension.getURL('css/jquery.toolbars.css'));
    jqcss.setAttribute('rel', 'stylesheet');

    var buttoncss = document.createElement('link');
    buttoncss.setAttribute('href', chrome.extension.getURL('css/bootstrap.icons.css'));
    buttoncss.setAttribute('rel', 'stylesheet');

    var bootstrapcss = document.createElement('link');
    bootstrapcss.setAttribute('href', chrome.extension.getURL('bootstrap/css/bootstrap.css'));
    bootstrapcss.setAttribute('rel', 'stylesheet');

    var customcss = document.createElement('link');
    customcss.setAttribute('href', chrome.extension.getURL('bootstrap/css/custom.css'));
    customcss.setAttribute('rel', 'stylesheet');

    document.head.appendChild(jqcss);
    document.head.appendChild(buttoncss);
    document.head.appendChild(bootstrapcss);
    document.head.appendChild(customcss);


    var jq = document.createElement('script');
    jq.setAttribute('src', chrome.extension.getURL('js/jquery/jquery.js'));
    document.body.appendChild(jq);
    setTimeout(function () {

        var slidepanel = document.createElement('script');
        slidepanel.setAttribute('src', chrome.extension.getURL('js/jquery/jquery.toolbar.js'));
        document.body.appendChild(slidepanel);
        setTimeout(function () {

            var bootstrap = document.createElement('script');
            bootstrap.setAttribute('src', chrome.extension.getURL('bootstrap/js/bootstrap.js'));
            document.body.appendChild(bootstrap);
            setTimeout(function () {
                insertButton();
            }, 1);
        }, 1);
    }, 1);   
}
//loadScriptsAndCSS();