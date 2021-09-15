
function syncStorageSet(key, value, callback) {
    const data = {}
    data[key] = value
    chrome.storage.sync.set(data, () => {
        if (callback) { callback(); }
    });
}

chrome.runtime.onInstalled.addListener(() => {
    //initialize storage to avoid error caused by undefined variables
    syncStorageSet("FOLLOWING_TUTORIAL_STATUS", "NOT_FOLLOWING_TUTORIAL");
    syncStorageSet("RECORDING_STATUS", "NOT_RECORDING")
    syncStorageSet("IS_RECORDING_ACTIONS", false)
    syncStorageSet("CURRENT_URL", "")
    syncStorageSet("STEP_ACTION_TYPE", "STEP_ACTION_TYPE_NULL")
});
