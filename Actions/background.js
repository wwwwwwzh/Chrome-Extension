chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [
            "./packages/jquery-3.6.0.min.js",
            // "./packages/firebase-analytics.js",
            // "./packages/firebase-firestore.js",
            // "./packages/firebase-app.js",
            //"./packages/firebase.js",
            "constants.js",
            "content.js"
        ]
    });
});

