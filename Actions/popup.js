$(() => {
    chrome.storage.sync.get("isRecordinigTutorial", ({ isRecordinigTutorial }) => {
        recordTutorialSwitch.prop('checked', isRecordinigTutorial);
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
    chrome.storage.sync.set({
        isRecordinigTutorial: checked
    });
}