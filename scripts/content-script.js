//Manipulate the current open tab's DOM in content-script.js.

//Only CTAs have "a" elements wih the "aria-label" attribute in idrelay. Therefore querySelectorAll('a[aria-label]') gets matching elements as a list in listEl.
let listEl = document.querySelectorAll('a[aria-label]');
let listAria = [];
let listTitle = [];

//Populate listAria and listTitle as a list with the aria-label and title values found in the listEl
listEl.forEach(el => {
    listAria.push(el.ariaLabel);
    listTitle.push(el.title);
})


//document.getElementById("change").textContent = listAria; //Just for testing purposes

//Send the listAria and listTitle to background.js
chrome.runtime.sendMessage({action:"ariaTitleData",listAria:listAria,listTitle:listTitle});

chrome.runtime.onMessage.addListener(function(request,sender,sendResponse) {
    let newTitles = [];
    if (request.action == "btnChangeClicked") {
        listEl.forEach(el => {
            if (el.ariaLabel != el.title) {
                el.setAttribute("title",el.ariaLabel);
                newTitles.push(el.title);
            }
        })
    }

    sendResponse({ data: newTitles })
})

//idrelay has nested iFrames. preview-template iFrame contains the html document that needs to be manipulated in order for the content script to work. 
//Below is an example with real id values to get preview-template iFrame as the new DOM.

//let newDoc = document.getElementById("idreditor");
//let newFraDoc = newDoc.contentWindow.document;
//let newFra = newFraDoc.getElementById("preview-template");
//let docObj = newFra.contentWindow.document;
//let listEl = docObj.querySelectorAll('a[aria-label]');