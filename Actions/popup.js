$(() => {
    //UI elements
    let recordTutorialSwitchContainer = $('#record-tutorial-switch-container');
    let recordTutorialSwitch = $('#record-tutorial-switch');

    let newTutorialButtonContainer = $('#new-tutorial-button-container');
    let newTutorialButton = $('#new-tutorial-button');

    let stopNewTutorialButtonContainer = $('#stop-new-tutorial-button-container');
    let stopNewTutorialButton = $('#stop-new-tutorial-button');

    let addDescriptionContainer = $("#add-description-container");
    let addDescriptionInput = $("#add-description-input");

    let addDescriptionSubmitContainer = $("#add-description-submit-container");
    let addDescriptionSubmitButton = $('#add-description-submit-button');

    let newTutorialNameInputContainer = $('#new-tutorial-name-input-container');
    let newTutorialNameInput = $('#new-tutorial-name-input');

    let newTutorialNameButtonContainer = $('#new-tutorial-name-button-container');
    let newTutorialNameButton = $('#new-tutorial-name-button');

    //helper function for starting or ending a tutorial (not for each step)
    function toogleRecording(recording) {
        if (recording) {
            recordTutorialSwitchContainer.show();
            stopNewTutorialButtonContainer.show();
            addDescriptionContainer.show();
            addDescriptionInput.show();
            addDescriptionSubmitButton.show();
            newTutorialButtonContainer.hide();
            addDescriptionSubmitContainer.show();
            newTutorialNameInputContainer.hide();
            newTutorialNameButtonContainer.hide();
        } else {
            newTutorialButtonContainer.show();
            recordTutorialSwitchContainer.hide();
            stopNewTutorialButtonContainer.hide();
            addDescriptionContainer.hide();
            addDescriptionInput.hide();
            addDescriptionSubmitButton.hide();
            addDescriptionSubmitContainer.hide();
        }
    }

    function onNewTutorialButtonClicked() {
        newTutorialNameInputContainer.show();
        newTutorialNameButtonContainer.show();
        newTutorialButtonContainer.hide();
        newTutorialNameButton.on('click', async () => {
            onNewTutorialNameButtonClicked();
        })
    }

    async function onNewTutorialNameButtonClicked() {
        if (newTutorialNameInput.val().length > 4) {
            syncStorageSet(VALUES.STORAGE.CURRENT_RECORDING_TUTORIAL_NAME, newTutorialNameInput.val());
            newTutorialNameInput.val('');
            let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            toogleRecording(true);
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: onStartNewTutorialRecording,
            });
        }
    }

    newTutorialButton.on('click', async () => {
        onNewTutorialButtonClicked();
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
    //executed per popup open. check previous states
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

    addDescriptionSubmitButton.on('click', async () => {
        const message = addDescriptionInput.val();
        addDescriptionInput.val('');
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