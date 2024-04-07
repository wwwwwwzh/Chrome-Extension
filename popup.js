// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestoreRef = getFirestore(app);

$(() => {
    //UI elements
    let newTutorialContainer = $('#new-tutorial-container');

    let newTutorialButtonContainer = $('#new-tutorial-button-container');
    let newTutorialButton = $('#new-tutorial-button');

    let newTutorialNameInputContainer = $('#new-tutorial-name-input-container');
    let newTutorialNameInput = $('#new-tutorial-name-input');

    let newTutorialNameButtonContainer = $('#new-tutorial-name-button-container');
    let newTutorialNameButton = $('#new-tutorial-name-button');

    //
    let stepDetailsContainer = $('#step-details-container');

    let recordTutorialSwitchContainer = $('#record-tutorial-switch-container');
    let recordTutorialSwitch = $('#record-tutorial-switch');


    let stepNameInputContainer = $("#step-name-input-container");
    let stepNameInput = $("#step-name-input");

    let stepDescriptionContainer = $("#step-description-container");
    let stepDescriptionInput = $("#step-description-input");

    let selectActionTypeContainer = $('#select-action-type-container');
    let selectActionTypeSelect = $('#select-action-type-select');

    let selectedElementIndicatorContainer = $('#selected-element-indicator-container');
    let selectedElementIndicator = $('#selected-element-indicator');

    let clickActionNameInputContainer = $('#click-action-name-input-container');
    let clickActionNameInput = $('#click-action-name-input');

    let clickActionDescriptionInputContainer = $('#click-action-description-input-container');
    let clickActionDescriptionInput = $('#click-action-description-input');

    let useAnyElementInTableContainer = $('#use-any-element-in-table-container');
    let useAnyElementInTableCheckbox = $('#use-any-element-in-table-checkbox');
    let useAnyElementInTableInput = $('#use-any-element-in-table-input');

    let addAlternativeActionButtonContainer = $('#add-alternative-action-button-container');
    let addAlternativeActionButton = $('#add-alternative-action-button');

    // let clickActionNextButtonContainer = $('#click-action-next-button-container');
    // let clickActionNextButton = $('#click-action-next-button');

    let inputActionDefaultInputContainer = $('#input-action-default-input-container');
    let inputActionDefaultInput = $('#input-action-default-input');

    let inputActionInputOptionsContainer = $('#input-action-input-options-container');
    let inputActionInputOptionTemplate = $('#input-action-input-option-container-template');



    let urlInputContainer = $('#url-input-container');
    let urlInput = $('#url-input');

    let useCustomStepUrlContainer = $('#use-custom-step-url-container');
    let useCustomStepUrlCheckbox = $('#use-custom-step-url-checkbox');

    let customStepUrlContainer = $('#custom-step-url-container');
    let customStepUrlInput = $('#custom-step-url-input');

    // let isMandatoryCheckboxContainer = $('#is-mandatory-checkbox-container');
    // let isMandatoryCheckbox = $('#is-mandatory-checkbox');

    let nextButtonContainer = $('#next-button-container');
    let nextButton = $('#next-button');

    let finishButtonContainer = $('#finish-button-container');
    let finishButton = $('#finish-button');

    let cancelButtonContainer = $('#cancel-button-container');
    let cancelButton = $('#cancel-button');

    let newIDButton = $('#submit-button');
    let loggerArea = $('#logger');
    let idBarInput = $('#id-input-field');

    newIDButton.on('click', async () => {
        loggerArea.hide();
        id = idBarInput.val()
        sendMessageToContentScript({ postIDtoFirebase: true, id});
        // postIDtoFirebase(idBarInput.val());
    })

    //MARK: new tutorial button set up
    newTutorialButton.on('click', async () => {
        sendMessageToContentScript({ newTutorial: true });
        //onNewTutorialButtonClicked();
    })

    function onNewTutorialButtonClicked() {
        newTutorialNameInputContainer.show();
        newTutorialNameButtonContainer.show();
        newTutorialButtonContainer.hide();
        newTutorialNameButton.on('click', async () => {
            onNewTutorialNameButtonClicked();
        })
    }

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

    if (false)
        hugeStorageGetMultiple([VALUES.RECORDING_STATUS.STATUS, VALUES.STORAGE.IS_RECORDING, VALUES.STORAGE.CURRENT_STEP_OBJ, VALUES.STORAGE.CURRENT_SELECTED_ELEMENT, VALUES.STORAGE.CURRENT_URL], (result) => {
            switch (result[VALUES.RECORDING_STATUS.STATUS]) {
                case VALUES.RECORDING_STATUS.RECORDING: case VALUES.RECORDING_STATUS.BEGAN_RECORDING:
                    recordTutorialSwitch.prop('checked', result[VALUES.STORAGE.IS_RECORDING]);
                    //TODO: get h3 element
                    $('h3').html(result[VALUES.STORAGE.IS_RECORDING] ? "Recording" : "Not Recording");
                    currentStepObj = result[VALUES.STORAGE.CURRENT_STEP_OBJ];
                    loadMenuFromStorage(currentStepObj);

                    const selectedElementPath = result[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT];
                    if (isNotNull(selectedElementPath)) {
                        selectedElementIndicator.html(`Selected Element: ${selectedElementPath.slice(max(selectedElementPath.length - 2, 0), selectedElementPath.length)}`)
                    } else {
                        selectedElementIndicator.html('Selected Element: None')
                    }
                    if (isNotNull(result[VALUES.STORAGE.CURRENT_URL])) {
                        customStepUrlInput.val(result[VALUES.STORAGE.CURRENT_URL]);
                    }

                    showStepContainer();
                    break;
                case VALUES.RECORDING_STATUS.NOT_RECORDING:
                    syncStorageSet(VALUES.STORAGE.IS_RECORDING, false);
                    sendMessageToContentScript({ isRecordingStatus: false });
                    showNewRecordingContainer();
                    break;
                default:
                    onStopNewTutorialRecording()
                    showNewRecordingContainer();
                    break;
            };
        });
        
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
            hugeStorageGetMultiple([indexKey], result => {
                currentStepObj = new Step(result[indexKey], VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL, new ClickAction(), "", "");
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

    selectActionTypeSelect.on('change', () => {
        switchMenu(selectActionTypeSelect.val());
    })

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

        hugeStorageGetMultiple(VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE, result => {
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

    //------------------------------------------------------------------------------------------------------------
    //MARK: attach listener to inputs------------------------------------------------------
    //------------------------------------------------------------------------------------------------------------
    stepNameInput.on('input', () => {
        updateCurrentStep(() => {
            currentStepObj.name = stepNameInput.val();
        })
    })

    stepDescriptionInput.on('input', () => {
        updateCurrentStep(() => {
            currentStepObj.description = stepDescriptionInput.val();
        })
    })

    urlInput.on('input', () => {
        const value = urlInput.val();
        updateCurrentStep(() => {
            callFunctionOnActionType(
                currentStepObj.actionType, null, () => {
                    //click & redirect
                    currentStepObj.actionObject.defaultClick.url = value;
                }, null, () => {
                    //redirect
                    currentStepObj.actionObject.url = value;
                }, null, null);
        })
    })

    inputActionDefaultInput.on('input', () => {
        const value = inputActionDefaultInput.val();
        updateCurrentStep(() => {
            callFunctionOnActionType(currentStepObj.actionType, null, null, () => {
                currentStepObj.actionObject.defaultText = value;
            }, null, null, null);
        })
    })

    clickActionNameInput.on('input', () => {
        const value = clickActionNameInput.val();
        updateCurrentStep(() => {
            callFunctionOnActionType(
                currentStepObj.actionType, () => {
                    //click
                    currentStepObj.actionObject.defaultClick.name = value;
                }, null, null, null, null, null);
        })
    })

    clickActionDescriptionInput.on('input', () => {
        const value = clickActionDescriptionInput.val();
        updateCurrentStep(() => {
            callFunctionOnActionType(
                currentStepObj.actionType, () => {
                    //click
                    currentStepObj.actionObject.defaultClick.description = value;
                }, null, null, null, null, null);
        })
    })

    useAnyElementInTableCheckbox.on('change', () => {
        const checked = useAnyElementInTableCheckbox.prop('checked');
        updateCurrentStep(() => {
            callFunctionOnActionType(
                currentStepObj.actionType, () => {
                    //click
                    currentStepObj.actionObject.defaultClick.useAnythingInTable = checked;
                    if (checked) {
                        currentStepObj.actionObject.defaultClick.table = useAnyElementInTableInput.val().split(',');
                    } else {
                        currentStepObj.actionObject.defaultClick.table = null;
                    }
                }, null, null, null, null, null);
        })
    })

    useCustomStepUrlCheckbox.on('change', () => {
        const checked = useCustomStepUrlCheckbox.prop('checked');
        if (checked) {
            customStepUrlContainer.show();
            if (isNotNull(currentStepObj.url)) {
                customStepUrlInput.val(currentStepObj.url);
            } else {
                hugeStorageGetMultiple(VALUES.STORAGE.CURRENT_URL, result => {
                    const currentUrl = result[VALUES.STORAGE.CURRENT_URL];
                    if (isNotNull(currentUrl)) {
                        customStepUrlInput.val(currentUrl);
                        currentStepObj.url = currentUrl;
                    }
                })
            }

        } else {
            customStepUrlContainer.hide();
        }
    })

    customStepUrlInput.on('input', () => {
        const value = customStepUrlInput.val();
        updateCurrentStep(() => {
            currentStepObj.url = value;
        })
    })

    useAnyElementInTableInput.on('input', () => {
        const value = useAnyElementInTableInput.val();
        updateCurrentStep(() => {
            callFunctionOnActionType(
                currentStepObj.actionType, () => {
                    //click
                    currentStepObj.actionObject.defaultClick.table = value.split(',');
                    syncStorageSet(VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE, value.split(','));
                }, null, null, null, null, null);
        })
    })
    //------------------------------------------------------------------------------------------------------------
    //MARK: button events------------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------------
    recordTutorialSwitch.on('change', () => {
        const checked = recordTutorialSwitch.prop('checked');
        syncStorageSet(VALUES.STORAGE.IS_RECORDING, checked, () => {
            $('h3').html(checked ? "Recording" : "Not Recording");
            sendMessageToContentScript({ isRecordingStatus: checked });
        })
    })

    addAlternativeActionButton.on('click', () => {
        let inputContainer = document.querySelector('.input-action-input-option-container-template').cloneNode(true);
        inputContainer.setAttribute('id', inputActionInputOptionTemplate.attr('id'));
        document.getElementById('input-action-input-options-container').appendChild(inputContainer);
        // inputContainer.querySelector('.input-action-input-options').addEventListener("input", event => {
        //     const value = event.target.value;
        // });
        inputContainer.querySelector('.input-action-input-options-delete').addEventListener("click", () => {
            inputContainer.remove();
        });
        inputContainer.hidden = false;
    })



    nextButton.on('click', async () => {
        onNextButtonClicked();
    })

    async function onNextButtonClicked() {
        hugeStorageGetMultiple([VALUES.STORAGE.CURRENT_SELECTED_ELEMENT], result => {
            const path = result[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT];
            if (!isNotNull(path) || isStringEmpty(path)) {
                alert("Please complete required fields first");
                return;
            }
            callFunctionOnActionType(
                currentStepObj.actionType,
                () => {
                    //click
                    currentStepObj.actionObject.defaultClick.path = path;
                }, () => {
                    //car
                    currentStepObj.actionObject.defaultClick.path = path;
                }, () => {
                    //input
                    //TODO: find input type
                    currentStepObj.actionObject.inputType = "text";
                    currentStepObj.actionObject.path = path;
                    document.querySelectorAll('.input-action-input-option-container-template').forEach((element, currentIndex, listObj) => {
                        currentStepObj.actionObject.optionsText.push(element.querySelector('.input-action-input-options').value);
                    })
                }, null, () => {
                    //select
                    const selectPath = path.slice(0, path.length - 1);
                    const selectedElement = $(jqueryElementStringFromDomPath(selectPath));
                    currentStepObj.actionObject.path = selectPath;
                    currentStepObj.actionObject.defaultValue = selectedElement.val();
                }, () => {
                    //instruction
                    currentStepObj.actionObject.path = path;
                });

            //check if step is complete
            if (isStepCompleted(currentStepObj)) {
                //upload to firebase
                addStepToFirebase(currentStepObj).then(() => {
                    var data = {};
                    data[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT] = null;
                    data[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE] = null;
                    data[VALUES.STORAGE.IS_RECORDING] = false;

                    syncStorageSetBatch(data, () => {
                        useAnyElementInTableInput.val('');
                        selectedElementIndicator.html('Selected Element: None');
                        recordTutorialSwitch.prop('checked', false);
                        //refresh menu
                        updateCurrentStep(() => { currentStepObj = null; })
                        loadMenuFromStorage(null);

                        //auto click the recorded element
                        sendMessageToContentScript({ clickPath: path, isRecordingStatus: false, removeHighlight: true });
                    });
                })
            } else {
                alert("Please complete required fields first");
            }
        })
    }

    finishButton.on('click', async () => {
        endRecordingHelper();
    })

    //TODO: cancel should delete current document if it exists
    cancelButton.on('click', async () => {
        deleteDocIfExists().then(() => {
            endRecordingHelper();
        });
    })

    function endRecordingHelper() {
        var data = {};
        data[VALUES.RECORDING_STATUS.STATUS] = VALUES.RECORDING_STATUS.NOT_RECORDING;
        data[VALUES.STORAGE.IS_RECORDING] = false;
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
        hugeStorageGetMultiple(VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID, async (result) => {
            const docId = result[VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID];
            if (isNotNull(docId)) {
                const tutorialRef = doc(firestoreRef, VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL, docId);
                await deleteDoc(tutorialRef);
            }
        })
    }

    async function addStepToFirebase(stepObj) {
        hugeStorageGetMultiple(VALUES.RECORDING_STATUS.STATUS, async (result) => {
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

    // async function postIDtoFirebase(id) {
    //        await setDoc(doc(ExtensionController.SHARED_FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.USER_ID, id), {})
    // }

    async function postDocToFirebase(stepObj, type, status) {
        var docId;
        var stepIndex = 0;
        try {
            switch (status) {
                case VALUES.RECORDING_STATUS.BEGAN_RECORDING:
                    hugeStorageGetMultiple([VALUES.STORAGE.CURRENT_RECORDING_TUTORIAL_NAME, VALUES.STORAGE.CURRENT_URL], async result => {
                        const docRef = await addDoc(collection(firestoreRef, type), {
                            name: result[VALUES.STORAGE.CURRENT_RECORDING_TUTORIAL_NAME],
                        });
                        docId = docRef.id;
                        syncStorageSet(VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID, docId);
                        await addTutorialStep(docId, result[VALUES.STORAGE.CURRENT_URL]);
                    })

                    break;
                case VALUES.RECORDING_STATUS.RECORDING:
                    hugeStorageGetMultiple([VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID, VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_STEP_INDEX, VALUES.STORAGE.CURRENT_URL], async (result) => {
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
})