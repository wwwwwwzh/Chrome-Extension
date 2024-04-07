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
        if (isNotNull(request.postIDtoFirebase) && request.id) {
            c(request.id)
            c(doc( getFirestore(initializeApp(firebaseConfig)), VALUES.FIRESTORE_CONSTANTS.USER_ID, request.id))
            // c(doc(extension.SHARED_FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.USER_ID))
            // setDoc(doc(extension.SHARED_FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.USER_ID, request.id), {})
        }

    }
);

chrome.storage.onChanged.addListener((changes, areaName) => {
    // console.log(JSON.stringify(changes))
})

