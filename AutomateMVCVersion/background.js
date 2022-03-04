try {
    importScripts("./ContentScripts/constants.js");
} catch (e) {
    console.log(e);
}

chrome.runtime.onInstalled.addListener(() => {
    //initialize storage to avoid error caused by null variables
    syncStorageSet(VALUES.TUTORIAL_STATUS.STATUS, VALUES.TUTORIAL_STATUS.BEFORE_INIT_NULL);
    // syncStorageSet("RECORDING_STATUS", "NOT_RECORDING")
    // syncStorageSet("IS_RECORDING_ACTIONS", false)
    syncStorageSet("CURRENT_URL", "")
    syncStorageSet("STEP_ACTION_TYPE", "STEP_ACTION_TYPE_NULL");
    syncStorageSet("CURRENT_STEP_OBJ", null);
    syncStorageSet("CURRENT_SELECTED_ELEMENT", null);
    syncStorageSet('REVISIT_PAGE_COUNT', 0);
    syncStorageSet(VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE, null)
    syncStorageSet(VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL, null)
    syncStorageSet(VALUES.STORAGE.ALL_OTHER_TUTORIALS, null)
});


// chrome.tabs.onActivated.addListener(() => {
//     chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//         chrome.tabs.sendMessage(tabs[0].id, { onActivated: true }, function (response) {

//         });
//     });
// })
