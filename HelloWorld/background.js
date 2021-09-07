chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['jquery-3.6.0.min.js', 'content.js']
    });
});