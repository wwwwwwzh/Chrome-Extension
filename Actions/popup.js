$(() => {
    let recordTutorialSwitch = $('#record-tutorial-switch');
    let recordTutorialSwitchContainer = $('#record-tutorial-switch-container');
    let newTutorialButton = $('#new-tutorial-button');
    let stopNewTutorialButton = $('#stop-new-tutorial-button');

    newTutorialButton.on('click', async () => {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        recordTutorialSwitchContainer.show()
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: onStartNewTutorialRecording,
        })
    })

    stopNewTutorialButton.on('click', async () => {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        recordTutorialSwitchContainer.hide()
        recordTutorialSwitch.prop('checked', false);
        newTutorialButton.show()
        stopNewTutorialButton.hide()
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: onStopNewTutorialRecording,
        })
    })

    chrome.storage.sync.get(VALUES.RECORDING_STATUS.STATUS, (result) => {
        switch (result[VALUES.RECORDING_STATUS.STATUS]) {
            case VALUES.RECORDING_STATUS.RECORDING:
                recordTutorialSwitchContainer.show()
                newTutorialButton.hide()
                stopNewTutorialButton.show()
                chrome.storage.sync.get(VALUES.STORAGE.IS_RECORDING_ACTIONS, (result) => {
                    recordTutorialSwitch.prop('checked', result[VALUES.STORAGE.IS_RECORDING_ACTIONS]);
                });
                break;
            case VALUES.RECORDING_STATUS.NOT_RECORDING:
                recordTutorialSwitchContainer.hide()
                newTutorialButton.show()
                stopNewTutorialButton.hide()
                break;
            case VALUES.RECORDING_STATUS.BEGAN_RECORDING: {
                recordTutorialSwitchContainer.show()
                newTutorialButton.hide()
                stopNewTutorialButton.show()
                break;
            }
            default:

                recordTutorialSwitchContainer.hide()
                newTutorialButton.show()
                stopNewTutorialButton.hide()
                const data = {}
                data[VALUES.RECORDING_STATUS.STATUS] = VALUES.RECORDING_STATUS.NOT_RECORDING
                chrome.storage.sync.set(data);
                break;
        };
    });

    // When the button is clicked, inject setPageBackgroundColor into current page
    recordTutorialSwitch.on('change', async () => {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        const checked = recordTutorialSwitch.prop('checked')

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: onRecordTutorialSwitchChanged,
            args: [checked]
        })
    })
})

function onStartNewTutorialRecording() {
    syncStorageSet(VALUES.RECORDING_STATUS.STATUS, VALUES.RECORDING_STATUS.BEGAN_RECORDING)
}

function onStopNewTutorialRecording() {
    syncStorageSet(VALUES.RECORDING_STATUS.STATUS, VALUES.RECORDING_STATUS.NOT_RECORDING)
    syncStorageSet(VALUES.STORAGE.IS_RECORDING_ACTIONS, false)
}

function onRecordTutorialSwitchChanged(checked) {
    syncStorageSet(VALUES.STORAGE.IS_RECORDING_ACTIONS, checked)
}