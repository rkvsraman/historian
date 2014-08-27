function insertButton() {


    var button = document.createElement('button');
    button.setAttribute('class', 'toolfixed');
    button.setAttribute('id', 'hoverButton');

    var bImg = document.createElement('img');
    bImg.setAttribute('src', chrome.extension.getURL('icons/icon16.png'));
    button.appendChild(bImg);

    document.body.appendChild(button);


    document.body.innerHTML += '<div id="user-toolbar-options"><a href="#"><i class="icon-user"></i></a><a href="#"><i class="icon-star"></i></a><a href="#"><i class="icon-edit"></i></a><a href="#"><i class="icon-delete"></i></a><a href="#"><i class="icon-ban"></i></a></div>';
}

$(document).ready(function () {


    insertButton();

    $('#hoverButton').toolbar({
        content: '#user-toolbar-options',
        position: 'bottom'
    });
});