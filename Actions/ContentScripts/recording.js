//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
//MARK: recording menu
//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
async function onNewTutorialNameButtonClicked() {
    if (newTutorialNameInput.val().length > 1) {
        var data = {};
        data[VALUES.STORAGE.CURRENT_RECORDING_TUTORIAL_NAME] = newTutorialNameInput.val();
        data[VALUES.RECORDING_STATUS.STATUS] = VALUES.RECORDING_STATUS.BEGAN_RECORDING;
        data[VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_STEP_INDEX] = 0;
        data[VALUES.STORAGE.CURRENT_STEP_OBJ] = null;
        data[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT] = null;
        data[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE] = null;
        syncStorageSetBatch(data);
        newTutorialNameInput.val('');
        showStepContainer();
    }
}

//MARK: Set up menu if needed
function showStepContainer() {
    newTutorialContainer.hide();
    stepDetailsContainer.show();
}

function showNewRecordingContainer() {
    stepDetailsContainer.hide();
    newTutorialContainer.show();
}


var currentStepObj = null;

// chrome.storage.sync.get([VALUES.RECORDING_STATUS.STATUS, VALUES.STORAGE.IS_RECORDING_ACTIONS, VALUES.STORAGE.CURRENT_STEP_OBJ, VALUES.STORAGE.CURRENT_SELECTED_ELEMENT, VALUES.STORAGE.CURRENT_URL], (result) => {
//     switch (result[VALUES.RECORDING_STATUS.STATUS]) {
//         case VALUES.RECORDING_STATUS.RECORDING: case VALUES.RECORDING_STATUS.BEGAN_RECORDING:
//             recordTutorialSwitch.prop('checked', result[VALUES.STORAGE.IS_RECORDING_ACTIONS]);
//             //TODO: get h3 element
//             $('h3').html(result[VALUES.STORAGE.IS_RECORDING_ACTIONS] ? "Recording" : "Not Recording");
//             currentStepObj = result[VALUES.STORAGE.CURRENT_STEP_OBJ];
//             loadMenuFromStorage(currentStepObj);

//             const selectedElementPath = result[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT];
//             if (isNotNull(selectedElementPath)) {
//                 selectedElementIndicator.html(`Selected Element: ${selectedElementPath.slice(max(selectedElementPath.length - 2, 0), selectedElementPath.length)}`)
//             } else {
//                 selectedElementIndicator.html('Selected Element: None')
//             }
//             if (isNotNull(result[VALUES.STORAGE.CURRENT_URL])) {
//                 customStepUrlInput.val(result[VALUES.STORAGE.CURRENT_URL]);
//             }

//             showStepContainer();
//             break;
//         case VALUES.RECORDING_STATUS.NOT_RECORDING:
//             syncStorageSet(VALUES.STORAGE.IS_RECORDING_ACTIONS, false);
//             sendMessageToContentScript({ isRecordingStatus: false });
//             showNewRecordingContainer();
//             break;
//         default:
//             onStopNewTutorialRecording()
//             showNewRecordingContainer();
//             break;
//     };
// });

function loadMenuFromStorage(currentStepObj) {
    if (isNotNull(currentStepObj)) {
        switchMenu(currentStepObj.actionType);
        selectActionTypeSelect.val(currentStepObj.actionType);
        if (isNotNull(currentStepObj.url)) {
            useCustomStepUrlCheckbox.prop('checked', true);
            customStepUrlContainer.show();
            customStepUrlInput.val(currentStepObj.url);
        }
    } else {
        switchMenu(VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL);
        selectActionTypeSelect.val(VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL);
    }
}

//MARK: Helper functions to retrieve and update step object 
function storeCurrentStep() {
    syncStorageSet(VALUES.STORAGE.CURRENT_STEP_OBJ, currentStepObj);
}

function prepareCurrentStep(callback = () => { }) {
    //check if step exists
    if (!isNotNull(currentStepObj)) {
        const indexKey = VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_STEP_INDEX;
        chrome.storage.sync.get([indexKey], result => {
            currentStepObj = new Step(result[indexKey], VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL, new NullAction(), "", "");
            callback();
        })
    } else {
        callback();
    }
}

function updateCurrentStep(update) {
    prepareCurrentStep(() => {
        update();
        storeCurrentStep();
    });
}



function callFunctionOnActionType(actionType, clickFunc, carFunc, inputFunc, redirectFunc, selectFunc, instructionFunc, nullFunc = null, defaultFunc = null) {
    switch (actionType) {
        case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL:
            (nullFunc !== null) && nullFunc();
            break;
        case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK:
            (clickFunc !== null) && clickFunc();
            break;
        case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK_REDIRECT:
            (carFunc !== null) && carFunc();
            break;
        case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_INPUT:
            (inputFunc !== null) && inputFunc();
            break;
        case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_REDIRECT:
            (redirectFunc !== null) && redirectFunc();
            break;
        case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_SELECT:
            (selectFunc !== null) && selectFunc();
            break;
        case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_SIDE_INSTRUCTION:
            (instructionFunc !== null) && instructionFunc();
            break;
        default:
            (defaultFunc !== null) && defaultFunc();
            break;
    }
}

function switchMenu(selection) {
    callFunctionOnActionType(selection, showClickMenu, showClickAndRedirectMenu, showInputMenu, showRedirectMenu, showSelectMenu, showSideInstructionMenu, showNullMenu);
    updateCurrentStep(() => {
        if (currentStepObj.actionType !== selection) {
            currentStepObj.actionType = selection;
            callFunctionOnActionType(
                selection,
                () => {
                    currentStepObj.actionObject = new ClickAction(new ClickGuide([], null, null, false, null, false, null), []);
                }, () => {
                    currentStepObj.actionObject = new ClickAction(new ClickGuide([], null, null, true, null, false, null), []);
                }, () => {
                    currentStepObj.actionObject = new InputAction([], "", [], false, VALUES.INPUT_TYPES.TEXT);
                }, () => {
                    currentStepObj.actionObject = new RedirectAction(null);
                }, () => {
                    currentStepObj.actionObject = new SelectAction([], null, false);
                }, () => {
                    currentStepObj.actionObject = new SideInstructionAction([]);
                }, () => {
                    currentStepObj.actionObject = new NullAction();
                });

        }
        loadMenuItems(selection);
    });
}

function loadMenuItems(selection) {
    stepNameInput.val(currentStepObj.name);
    stepDescriptionInput.val(currentStepObj.description);
    callFunctionOnActionType(
        selection,
        () => {
            //click
            clickActionNameInput.val(currentStepObj.actionObject.defaultClick.name);
            clickActionDescriptionInput.val(currentStepObj.actionObject.defaultClick.description);
        }, () => {
            //car
            urlInput.val(currentStepObj.actionObject.defaultClick.url);
        }, () => {
            //input
            inputActionDefaultInput.val(currentStepObj.actionObject.defaultText)
        }, () => {
            //redirect
            urlInput.val(currentStepObj.actionObject.url);
        }, () => {
            //select
        }, () => {
            //side instruction
        });
}
//------------------------------------------------------------------------------------------------------------
//MARK: Step action menu UI manipulation ------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
function clearCurrentMenu() {
    stepDetailsContainer.children().hide();
    $('.common-action-container').show();
    selectedElementIndicatorContainer.show();
}

function showNullMenu() {
    stepDetailsContainer.children().hide();
    $('.common-action-container').show();
}

function showClickMenu() {
    clearCurrentMenu();
    $('.customizable-action-container').show();
    $('.click-action-container').show();
    addAlternativeActionButton.html('Add Alternative Click');

    chrome.storage.sync.get(VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE, result => {
        const table = result[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE];
        if (!isNotNull(table)) {
        } else {
            useAnyElementInTableInput.val(table)
        }
    })
}

function showInputMenu() {
    clearCurrentMenu();
    $('.input-action-container').show();
    $('.customizable-action-container').show();
    addAlternativeActionButton.html('Add Alternative Input');
}

function showClickAndRedirectMenu() {
    clearCurrentMenu();
    urlInputContainer.show();
}

function showRedirectMenu() {
    clearCurrentMenu();
    selectedElementIndicatorContainer.hide();
    urlInputContainer.show();
}

function showSelectMenu() {
    clearCurrentMenu();
}

function showSideInstructionMenu() {
    clearCurrentMenu();
}



function endRecordingHelper() {
    var data = {};
    data[VALUES.RECORDING_STATUS.STATUS] = VALUES.RECORDING_STATUS.NOT_RECORDING;
    data[VALUES.STORAGE.IS_RECORDING_ACTIONS] = false;
    data[VALUES.STORAGE.CURRENT_RECORDING_TUTORIAL_NAME] = null;
    data[VALUES.STORAGE.CURRENT_STEP_OBJ] = null;
    data[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT] = null;
    data[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE] = null;
    data[VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID] = null;
    data[VALUES.STORAGE.STEP_ACTION_TYPE] = VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL;
    sendMessageToContentScript({ isRecordingStatus: false });
    syncStorageSetBatch(data);
    showNewRecordingContainer();

}
//------------------------------------------------------------------------------------------------------------
//MARK: Firebase actions------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
async function deleteDocIfExists() {
    chrome.storage.sync.get(VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID, async (result) => {
        const docId = result[VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID];
        if (isNotNull(docId)) {
            const tutorialRef = doc(firestoreRef, VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL, docId);
            await deleteDoc(tutorialRef);
        }
    })
}

async function addStepToFirebase(stepObj) {
    chrome.storage.sync.get(VALUES.RECORDING_STATUS.STATUS, async (result) => {
        switch (result[VALUES.RECORDING_STATUS.STATUS]) {
            case VALUES.RECORDING_STATUS.BEGAN_RECORDING:
                await postDocToFirebase(
                    stepObj,
                    VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL,
                    VALUES.RECORDING_STATUS.BEGAN_RECORDING
                ).then(() => {
                    syncStorageSet(VALUES.RECORDING_STATUS.STATUS, VALUES.RECORDING_STATUS.RECORDING);
                })
                break;
            case VALUES.RECORDING_STATUS.RECORDING:
                await postDocToFirebase(
                    stepObj,
                    VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL,
                    VALUES.RECORDING_STATUS.RECORDING
                );
                break;
            default:
                break;
        };
    });
}

async function postDocToFirebase(stepObj, type, status) {
    var docId;
    var stepIndex = 0;
    try {
        switch (status) {
            case VALUES.RECORDING_STATUS.BEGAN_RECORDING:
                chrome.storage.sync.get([VALUES.STORAGE.CURRENT_RECORDING_TUTORIAL_NAME, VALUES.STORAGE.CURRENT_URL], async result => {
                    const docRef = await addDoc(collection(firestoreRef, type), {
                        name: result[VALUES.STORAGE.CURRENT_RECORDING_TUTORIAL_NAME],
                    });
                    docId = docRef.id;
                    syncStorageSet(VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID, docId);
                    await addTutorialStep(docId, result[VALUES.STORAGE.CURRENT_URL]);
                })

                break;
            case VALUES.RECORDING_STATUS.RECORDING:
                chrome.storage.sync.get([VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID, VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_STEP_INDEX, VALUES.STORAGE.CURRENT_URL], async (result) => {
                    stepIndex = result[VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_STEP_INDEX] + 1;
                    docId = result[VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID];
                    await addTutorialStep(docId, result[VALUES.STORAGE.CURRENT_URL]);
                });
                break;
            default:
                break;
        }
    } catch (e) {
        console.error("Error adding document: ", e);
    }

    async function addTutorialStep(docId, currentUrl) {
        if (isNotNull(docId)) {
            syncStorageSet(VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_STEP_INDEX, stepIndex);
            //doc object
            stepObj.index = stepIndex;
            if (!isNotNull(stepObj.url)) {
                stepObj.url = currentUrl;
            }

            await addDoc(collection(firestoreRef, type, docId, "Steps"), JSON.parse(JSON.stringify(stepObj)));
            const tutorialRef = doc(firestoreRef, type, docId);
            await updateDoc(tutorialRef, {
                all_urls: arrayUnion(currentUrl),
            })
            if (stepObj.actionType === VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_REDIRECT || stepObj.actionType === VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK_REDIRECT) {
                //after posting to firebase, redirect to specified url
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, { redirect: urlInput.val() });
                });
            }
        }
    }
}