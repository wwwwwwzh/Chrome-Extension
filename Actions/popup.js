$(() => {
    //UI elements
    let recordTutorialSwitch = $('#record-tutorial-switch');
    let recordTutorialSwitchContainer = $('#record-tutorial-switch-container');
    let newTutorialButton = $('#new-tutorial-button');
    let stopNewTutorialButton = $('#stop-new-tutorial-button');
    let newTutorialButtonContainer = $('#new-tutorial-button-container');
    let stopNewTutorialButtonContainer = $('#stop-new-tutorial-button-container');
    let addDescriptionContainer = $("#add-description-container");
    let addDescriptionInput = $("#add-description-input");
    let addDescriptionSubmitContainer = $("#add-description-submit-container");
    let addDescriptionSubmitButton = $('#add-description-submit-button');

    function toogleRecording(recording) {
        if (recording) {
            recordTutorialSwitchContainer.show();
            newTutorialButtonContainer.hide();
            stopNewTutorialButtonContainer.show();
            addDescriptionContainer.show();
            addDescriptionInput.show();
            addDescriptionSubmitButton.show();
            addDescriptionSubmitContainer.show();
        } else {
            recordTutorialSwitchContainer.hide();
            newTutorialButtonContainer.show();
            stopNewTutorialButtonContainer.hide();
            addDescriptionContainer.hide();
            addDescriptionInput.hide();
            addDescriptionSubmitButton.hide();
            addDescriptionSubmitContainer.hide();
        }
    }

    newTutorialButton.on('click', async () => {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        toogleRecording(true);
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: onStartNewTutorialRecording,
        })
    })

    stopNewTutorialButton.on('click', async () => {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        toogleRecording(false);
        recordTutorialSwitch.prop('checked', false);

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: onStopNewTutorialRecording,
        })
    })

    chrome.storage.sync.get(VALUES.RECORDING_STATUS.STATUS, (result) => {
        switch (result[VALUES.RECORDING_STATUS.STATUS]) {
            case VALUES.RECORDING_STATUS.RECORDING: case VALUES.RECORDING_STATUS.BEGAN_RECORDING:

                chrome.storage.sync.get(VALUES.STORAGE.IS_RECORDING_ACTIONS, (result) => {
                    recordTutorialSwitch.prop('checked', result[VALUES.STORAGE.IS_RECORDING_ACTIONS]);
                });
                toogleRecording(true);
                break;
            case VALUES.RECORDING_STATUS.NOT_RECORDING:
                syncStorageSet(VALUES.STORAGE.IS_RECORDING_ACTIONS, false);
                toogleRecording(false);
                break;
            default:
                onStopNewTutorialRecording()
                toogleRecording(false);
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

    addDescriptionSubmitButton.on('click', async () => {
        const message = addDescriptionInput.val();
        syncStorageSet(VALUES.STORAGE.DESCRIPTION_FOR_NEXT_STEP, message);
    })
})

function onStartNewTutorialRecording() {
    syncStorageSet(VALUES.RECORDING_STATUS.STATUS, VALUES.RECORDING_STATUS.BEGAN_RECORDING);
}

function onStopNewTutorialRecording() {
    syncStorageSet(VALUES.RECORDING_STATUS.STATUS, VALUES.RECORDING_STATUS.NOT_RECORDING);
    syncStorageSet(VALUES.STORAGE.IS_RECORDING_ACTIONS, false);
    syncStorageSet(VALUES.STORAGE.DESCRIPTION_FOR_NEXT_STEP, undefined);
}

function onRecordTutorialSwitchChanged(checked) {
    syncStorageSet(VALUES.STORAGE.IS_RECORDING_ACTIONS, checked)
}