//asynchronous function to get current open tab from Chrome. Return a Promise object.
async function getTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab
}

//Callback function on the getTab function doesn't allow to assign values to variables from the outer scope.
//Therefore the executeScript function that injects content-script.js to the current tab's DOM is executed inside getTab.then() function to use tab.id within executeScript.
document.getElementById("btn-check").addEventListener("click", () => {
    getTab().then(tab => {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["scripts/content-script.js"]
        })
    })
})

//Get the aria-label list sent by chrome.runtime.sendMessage in the content-script.js.
chrome.runtime.onMessage.addListener(function(request,sender,sendResponse) {
    //request.data contains the aria-label list
    if (request.data) {
        document.getElementById("aria-list").textContent = null; //Remove Click "Check" text in aria-list div element.
        //Add each aria-label in an h4 element along with the class opens-sans-reg. Add it to aria-list div as a child element.
        for (let aLabel of request.data) {
            let newElement = document.createElement("h4");
            newElement.classList.add("open-sans-reg");
            newElement.textContent = aLabel;
            document.getElementById("aria-list").appendChild(newElement); //aria-list div will consist of a list of h4 elements after the for loop
        }

        //Update the "n aria-labels found" text in footer
        document.getElementById("aria-count").textContent = request.data.length + " aria-labels found";
        
        sendResponse({status: "Data received"}); //Just for the formality of addListener's general arguments
    }
})
