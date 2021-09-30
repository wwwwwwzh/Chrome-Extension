try {
    importScripts("constants.js");
} catch (e) {
    console.log(e);
}

chrome.runtime.onInstalled.addListener(() => {
    //initialize storage to avoid error caused by undefined variables
    syncStorageSet("FOLLOWING_TUTORIAL_STATUS", "NOT_FOLLOWING_TUTORIAL");
    syncStorageSet("RECORDING_STATUS", "NOT_RECORDING")
    syncStorageSet("IS_RECORDING_ACTIONS", false)
    syncStorageSet("CURRENT_URL", "")
    syncStorageSet("STEP_ACTION_TYPE", "STEP_ACTION_TYPE_NULL");
    syncStorageSet("CURRENT_STEP_OBJ", undefined);
    syncStorageSet("CURRENT_SELECTED_ELEMENT", undefined);
    syncStorageSet('AUTOMATION_SPEED', 50);
    syncStorageSet('REVISIT_PAGE_COUNT', 0);
    syncStorageSet(VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE, null)
});
