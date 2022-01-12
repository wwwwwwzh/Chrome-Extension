let extension
let globalCache

$(() => {
    globalCache = new GlobalCache()
    extension = new ExtensionController()
})



//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
//MARK: message handler
//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (isNotNull(request.redirect)) {
            location.replace(request.redirect)
        }
        if (isNotNull(request.clickPath)) {
            simulateClick($(jqueryElementStringFromDomPath(request.clickPath))[0]);
        }
        if (isNotNull(request.removeHighlight) && request.removeHighlight) {
            removeLastHighlight()
        }
        if (isNotNull(request.onActivated) && request.onActivated) {
            checkStatus();
        }
        if (isNotNull(request.newTutorial) && request.newTutorial) {
            //recordingContainer.show();
            extension.showRecordingPanel();
        }
    }
);

chrome.storage.onChanged.addListener((changes, areaName) => {
    //console.log(JSON.stringify(changes))
})

