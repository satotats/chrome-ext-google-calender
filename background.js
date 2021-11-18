const googleCalenderRootUrl = 'https://calendar.google.com/calendar';

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ coolingDown: false });
    console.log("set inital value: coolingDown=" + coolingDown);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!tab.active) return;
    if (changeInfo.status != 'complete') return;

    let url = String(tab.url)
    console.log(url);

    if (url.startsWith(googleCalenderRootUrl)) {
        console.log("sir, yes sir");
        console.log(tab);

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: addWheelEvent,
        });
    }
});


function addWheelEvent() {
    let body = document.querySelectorAll('[role="main"]')[0];

    body.addEventListener('wheel', (e) => {
        if (!e.ctrlKey) return;
        e.preventDefault();
        console.log("ctrl pressed");

        chrome.storage.local.get("coolingDown", ({ coolingDown }) => {
            if (coolingDown) return;

            chrome.storage.local.set({
                coolingDown: true,
            });

            const scales = ["year", "month", "week", "day"]
            // const keys = ["Y", "M", "W", "D"] // the way to send key is not existing... 
            const url = document.URL

            const i = scales.findIndex(scale => url.includes(scale))
            console.log(scales[i])

            let newIndex;
            if (e.deltaY < 0) {
                newIndex = i + 1
                console.log("scale in");
            } else {
                newIndex = i - 1
                console.log("scale out");
            }
            console.log("newIndex=" + newIndex + ", scale=" + scales[newIndex])

            if (scales.length <= newIndex) return;

            // let pulldown = document.querySelectorAll('[data-active-view="month"] [role="button"]')[0];
            // pulldown.click();
            // let items = document.querySelectorAll('[role="menu"] [role="menuitem"]')[newIndex]; // this index is wrong(the order of elements is not guaranteed)
            // items.click(); // this does not work

            setTimeout(() => {
                chrome.storage.local.set({ coolingDown: false });
                console.log("coolingDown finished");
            }, 500);
        })
    });
}
