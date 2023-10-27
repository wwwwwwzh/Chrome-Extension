let extension
let globalCache

const DEBUG_OPTION = 0b0001

$(() => {
    globalCache = new GlobalCache()
    extension = new ExtensionController()
    // extension.showRecordingPanel(VALUES.TUTORIAL_STATUS.IS_CREATING_NEW_TUTORIAL)
    // UserEventListnerHandler.tutorialStatusCache = VALUES.TUTORIAL_STATUS.IS_RECORDING
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
        if (isNotNull(request.newTutorial) && request.newTutorial) {
            //recordingContainer.show();
            extension.showRecordingPanel(VALUES.TUTORIAL_STATUS.IS_CREATING_NEW_TUTORIAL);
        }
    }
);

chrome.storage.onChanged.addListener((changes, areaName) => {
    console.log(JSON.stringify(changes))
})

