$(() => {
    chrome.storage.sync.get(VALUES.STORAGE.IS_RECORDING_ACTIONS, (result) => {
        recordTutorialSwitch.prop('checked', result[VALUES.STORAGE.IS_RECORDING_ACTIONS]);
    });
    // Initialize button with user's preferred color
    let recordTutorialSwitch = $('#record-tutorial-switch')


    // When the button is clicked, inject setPageBackgroundColor into current page
    recordTutorialSwitch.change(async () => {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        const checked = recordTutorialSwitch.prop('checked')

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: onRecordTutorialSwitchChanged,
            args: [checked]
        })
    })
})

function onRecordTutorialSwitchChanged(checked) {
    const data = {}
    data[VALUES.STORAGE.IS_RECORDING_ACTIONS] = checked
    chrome.storage.sync.set(data);
}