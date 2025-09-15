//Manipulate the current open tab's DOM
let listEl = document.querySelectorAll('a[aria-label]');
let listAr = [];

//Populate listAr as a list with the aria-labels found in the current DOM
listEl.forEach(el => {
    listAr.push(el.ariaLabel);
})

document.getElementById("change").textContent = listAr; //Just for testing purposes

//Send the listAr to background.js
chrome.runtime.sendMessage({data:listAr});

listEl.forEach(el => {
    el.setAttribute("title","newTitle");
})
