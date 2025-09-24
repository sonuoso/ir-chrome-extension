//asynchronous function to get current open tab from Chrome. Return a Promise object.
async function getTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab
}

//tab ID is necessary for both "btn-check" and "btn-change" event handlers.
//Therefore the Promise object reponse is stored in openTab to be used in both callback functions later.
let openTab = getTab();

//Callback function on the getTab function doesn't allow to assign values to variables from the outer scope.
//Therefore the executeScript function that injects content-script.js to the current tab's DOM is executed inside openTab.then() function to use tab.id within executeScript.
document.getElementById("btn-check").addEventListener("click", () => {
    openTab.then(tab => {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["scripts/content-script.js"]
        })
    })
})

let ariaLabels = [];
let titles = [];

//Listen to messages sent by chrome.runtime.sendMessage in the content-script.js.
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "ariaTitleData") {
        ariaLabels = request.listAria;
        titles = request.listTitle;
        let ariaMatch = document.getElementById("aria-match");
       
        if (ariaLabels.length == titles.length) {
            document.getElementById("aria-list").textContent = null; //Remove Click "Check" text in aria-list div element.
            ariaMatch.classList.remove("circle-red");
            ariaMatch.classList.add("circle-green");

            //Add each aria-label in an h4 element along with the class opens-sans-reg. Add it to aria-list div as a child element.
            for (let a = 0; a < ariaLabels.length; a++) {
                let newElement = document.createElement("h4");
                newElement.classList.add("open-sans-reg");

                //Replace &nbsp; values found in aria-lable or titles and replace with a " " value. Otherwise "if (aria==title)" always returns false.
                let aria = ariaLabels[a].replace(/\u00A0/g," ");
                let title = titles[a].replace(/\u00A0/g," ");
               
                if (aria == title) {
                    newElement.innerHTML = '<span class="square-green-10"></span>' + ariaLabels[a];
                } else {
                    newElement.innerHTML = '<span class="square-red-10"></span>' + ariaLabels[a];
                }
                document.getElementById("aria-list").appendChild(newElement); //aria-list div will consist of a list of h4 elements after the for loop


                // let titleRatio = 0;
                // for (let i = 0; i < ariaLabels.length; i++) {
                //     if (ariaLabels[i] == titles[i]) {
                //         titleRatio+=1;
                //     }
            }



            //Update the "n aria-labels found" text in footer.
            document.getElementById("aria-count").textContent = ariaLabels.length + " aria-labels found";

            sendResponse({ status: "Data received" }); //Just for the formality of addListener's general arguments.
        }
    }
})

//When btn-change is clicked it sends a message to content-script.js where it will replace title values with aria-label values.
//Then content-script.js will send a new list of titles in its response object.
document.getElementById("btn-change").addEventListener("click", () => {
    openTab.then(tab => {
        chrome.tabs.sendMessage(tab.id, { action: "btnChangeClicked" }, function (response) {
            let newTitles = response.data;
            document.getElementById("aria-list").textContent = null;
            for (let a = 0; a < newTitles.length; a++) {
                let newElement = document.createElement("h4");
                newElement.classList.add("open-sans-reg");
                //Checks if an aria-label of a certain CTA is equal to its new corresponding title value.
                //If equal, add a green square in the beginning of the ariaLabel[0] text in the extension window's list of updated aria-labels.
                //Else add a red square along with the ariaLabel[0].
                if (ariaLabels[a] == newTitles[a]) {
                    newElement.innerHTML = '<span class="square-green-10"></span>' + ariaLabels[a];
                } else {
                    newElement.innerHTML = '<span class="square-red-10"></span>' + ariaLabels[a];
                }

                document.getElementById("aria-list").appendChild(newElement);
            }
        });
    })
})
