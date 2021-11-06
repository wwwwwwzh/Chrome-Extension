let mainPopUpContainer;
let mainDraggableArea;
let automationSpeedSlider;
let stopOptionsStopButton;
let popUpAutomateButton;
let popUpManualButton;
let popUpCancelButton;
let popUpStepName;
let popUpStepDescription;
let popUpNextStepButton;
let wrongPageRedirectButton;
let mainCloseButton;
let popUpHeader;

let highlightInstructionWindow;

let recordingContainer;
let recordingMenuDraggableArea;

let newTutorialContainer;
let newTutorialNameInput;
let newTutorialNameButton;
let stepDetailsContainer;
let recordTutorialSwitchContainer;
let recordTutorialSwitch;
let selectActionTypeContainer;
let selectActionTypeSelect;
let stepNameInput;
let stepDescriptionInput;
let selectedElementIndicator;
let clickActionNameInput;
let clickActionDescriptionInput;
let useAnyElementInTableContainer;
let useAnyElementInTableCheckbox;
let useAnyElementInTableInput;
let addAlternativeActionButtonContainer;
let addAlternativeActionButton;
let inputActionDefaultInputContainer;
let inputActionDefaultInput;
let inputActionInputOptionTemplate;
let urlInputContainer;
let urlInput;
let useCustomStepUrlContainer;
let useCustomStepUrlCheckbox;
let customStepUrlContainer;
let customStepUrlInput;
let nextButton;
let finishButton;
let cancelButton;

$(() => {
    const body = $('body');
    //tutorial menu
    body.append(
        `
        <div id="w-main-popup-container" class="w-main-popup">
            <div id="w-main-draggable-area"  class="w-common-item w-popup-draggable"></div>

            <div id="w-popup-header" class="w-common-item w-header">
                <div class="w-common-item w-close-button" id="w-main-close-button"></div>
            </div>

            <button id="w-popup-automate-button" class="w-follow-tutorial-options-item w-button-normal">Automate</button>
            <button id="w-popup-manual-button" class="w-follow-tutorial-options-item w-button-normal">Walk Me Through</button>
            <button id="w-popup-cancel-button" class="w-follow-tutorial-options-item w-button-normal">Cancel</button>

            <button id="w-popup-next-step-button" class="w-following-tutorial-item w-button-normal">Next</button>
            <button id="w-stop-options-stop-button" class="w-following-tutorial-item w-button-normal">Stop</button>
            
            <input type="range" min="1" max="100" value="50" id="w-automation-speed-slider" class="w-common-item">

            <a href="/" id="w-wrong-page-redirect-button" class="w-wrong-page-item w-wrong-page-redirect-button">You have an ongoing tutorial on [website address]</a>
        </div>
        <div id="w-highlight-instruction-window" class="w-highlight-instruction-window">
            <h3 id="w-popup-step-name" class="w-following-tutorial-item"></h3>
            <p id="w-popup-step-description" class="w-following-tutorial-item"></p>
        </div>
        `
    );
    mainPopUpContainer = $('#w-main-popup-container');

    mainDraggableArea = $('#w-main-draggable-area');
    makeElementDraggable(mainDraggableArea[0], mainPopUpContainer[0]);

    automationSpeedSlider = $('#w-automation-speed-slider');
    automationSpeedSlider.on('change', () => {
        onAutomationSpeedSliderChanged();
    })

    popUpHeader = $('#w-popup-header');
    mainCloseButton = $('#w-main-close-button');

    mainCloseButton.on("click", () => {
        if (globalCache.isMainPopUpCollapsed) {
            mainPopUpContainer.removeClass('w-popup-collapsed');
            mainPopUpContainer.addClass('w-main-popup');
            mainCloseButton.removeClass('w-close-button-collapsed');
            mainCloseButton.addClass('w-close-button');
            mainPopUpContainer.find('.w-should-reopen').show();
            mainPopUpContainer.find('.w-should-reopen').removeClass('w-should-reopen');

            globalCache.isMainPopUpCollapsed = false;
        } else {
            mainPopUpContainer.find(':visible').each((i, element) => {
                $(element).addClass('w-should-reopen');
            })
            mainPopUpContainer.removeClass('w-main-popup');
            mainPopUpContainer.addClass('w-popup-collapsed');
            mainPopUpContainer.children().hide();
            mainCloseButton.removeClass('w-close-button');
            mainCloseButton.addClass('w-close-button-collapsed');
            popUpHeader.show();
            mainDraggableArea.show();
            globalCache.isMainPopUpCollapsed = true;
        }
    })


    //choose options before start
    popUpAutomateButton = $("#w-popup-automate-button");
    popUpManualButton = $("#w-popup-manual-button");
    popUpCancelButton = $('#w-popup-cancel-button');
    popUpCancelButton.on('click', () => {
        $('.w-follow-tutorial-options-item').hide();
        fetchSimpleTutorials();
    })

    //guides during tutorial
    popUpNextStepButton = $("#w-popup-next-step-button");
    popUpNextStepButton.hide();
    popUpNextStepButton.on('click', event => {
        //auto go to next step
        globalCache.isAutomatingNextStep = true;
        showTutorialStepAuto();
    })

    stopOptionsStopButton = $('#w-stop-options-stop-button');
    stopOptionsStopButton.on('click', () => {
        onStopTutorialButtonClicked();
    });

    wrongPageRedirectButton = $('#w-wrong-page-redirect-button');

    mainPopUpContainer.hide();
    mainPopUpContainer.children().hide();
    $('.w-common-item').show();

    //Highlight instruction window
    highlightInstructionWindow = $('#w-highlight-instruction-window');
    highlightInstructionWindow.hide();

    popUpStepName = $("#w-popup-step-name");
    popUpStepName.css({ 'overflow-wrap': 'break-word', });
    popUpStepDescription = $("#w-popup-step-description");
    popUpStepDescription.css({ 'overflow-wrap': 'break-word', });

    //recording menu
    body.append(`
    <div id="w-recording-menu-container">
        <div id="w-recording-menu-draggable-area"  class="w-popup-draggable"></div>
        <div id="w-recording-menu-header" class="w-header">
            <div class="w-close-button" id="w-recording-menu-close-button"></div>
        </div>

        <div id="new-tutorial-container">
            <input type="text" placeholder="Tutorial Name" id="new-tutorial-name-input">
            <button id="new-tutorial-name-button" class="w-button-small">
                Ok
            </button>
        </div>


        <div id="step-details-container" class="element-container">
            <div id="record-tutorial-switch-container" class="element-container common-action-container">
                <h3>Recording </h3>
                <label id="is-recording-switch-label">
                    <input type="checkbox" id="record-tutorial-switch">
                    <span id="is-recording-switch-slider"></span>
                </label>
            </div>

            <div id="select-action-type-container" class="element-container common-action-container">
                <p>Action Type</p>
                <select name="action-type" id="select-action-type-select">
                    <option value="STEP_ACTION_TYPE_NULL">-</option>
                    <option value="STEP_ACTION_TYPE_REDIRECT">Redirect (Open another page directly)</option>
                    <!-- <option value="STEP_ACTION_TYPE_CLICK_REDIRECT">Click and redirect (Open another page by clicking)</option> -->
                    <option value="STEP_ACTION_TYPE_CLICK">Click</option>
                    <option value="STEP_ACTION_TYPE_INPUT">Input</option>
                    <!-- <option value="STEP_ACTION_TYPE_SELECT">Select</option> -->
                    <option value="STEP_ACTION_TYPE_SIDE_INSTRUCTION">Instruction</option>
                </select>
            </div>
            <input type="text" placeholder="Name" id="step-name-input" class="common-action">
            <textarea class="textarea" type="text" placeholder="Description for your action" id="step-description-input" class="common-action"></textarea>

            <p id="selected-element-indicator" class="common-action">Selected Element: None</p>
            <input type="text" placeholder="ID" id="click-action-name-input" class="click-action">
            <input type="text" placeholder="Description for this option" id="click-action-description-input" class="click-action">
            <div id="use-any-element-in-table-container" class="element-container click-action-container">
                <h4>Click anything in container?</h4>
                <input type="checkbox" id="use-any-element-in-table-checkbox">
                Container:
                <textarea type="text" id="use-any-element-in-table-input" class="textarea"
                    placeholder="no table or list as ancestor"></textarea>
            </div>
            <!-- <div id="click-action-next-button-container" class="element-container click-action-button">
                <button id="click-action-next-button" class="w-button-small">Next Action</button>
            </div> -->

            <input type="text" placeholder="input" id="input-action-default-input" class="input-action">
            <div class="input-action-input-option-container-template input-action">
                <input type="text" placeholder="input" class="input-action-input-options">
                <button class="input-action-input-options-delete w-button-small">Delete</button>
            </div>

            <input type="url" placeholder="URL" id="url-input" class="common-action">

            <div id="add-alternative-action-button-container" class="element-container customizable-action-container"
            >
                <button id="add-alternative-action-button" class="w-button-small">Add Alternative Clicks</button>
            </div>

            <div id="use-custom-step-url-container" class="element-container common-action">
                <h4>Add custom step associated url</h4>
                <input type="checkbox" id="use-custom-step-url-checkbox">
            </div>
            <div id="custom-step-url-container" class="element-container">
                <input type="url" placeholder="URL" id="custom-step-url-input" class="custom-step-url-input">
            </div>


            <button id="next-button" class="w-button-small common-action">Next</button>
            <button id="finish-button" class="w-button-small common-action">Finish Recording</button>
            <button id="cancel-button" class="w-button-small common-action">Cancel Recording</button>
        </div>



    </div>
    `);

    recordingContainer = $('#w-recording-menu-container');
    recordingContainer.hide();

    recordingMenuDraggableArea = $('#w-recording-menu-draggable-area');
    makeElementDraggable(recordingMenuDraggableArea[0], recordingContainer[0]);

    newTutorialContainer = $('#new-tutorial-container');

    newTutorialNameInput = $('#new-tutorial-name-input');
    newTutorialNameButton = $('#new-tutorial-name-button');

    stepDetailsContainer = $('#step-details-container');

    recordTutorialSwitchContainer = $('#record-tutorial-switch-container');
    recordTutorialSwitch = $('#record-tutorial-switch');


    selectActionTypeContainer = $('#select-action-type-container');
    selectActionTypeSelect = $('#select-action-type-select');


    stepNameInput = $("#step-name-input");
    stepDescriptionInput = $("#step-description-input");
    selectedElementIndicator = $('#selected-element-indicator');

    clickActionNameInput = $('#click-action-name-input');
    clickActionDescriptionInput = $('#click-action-description-input');

    useAnyElementInTableContainer = $('#use-any-element-in-table-container');
    useAnyElementInTableCheckbox = $('#use-any-element-in-table-checkbox');
    useAnyElementInTableInput = $('#use-any-element-in-table-input');

    addAlternativeActionButtonContainer = $('#add-alternative-action-button-container');
    addAlternativeActionButton = $('#add-alternative-action-button');

    inputActionDefaultInputContainer = $('#input-action-default-input-container');
    inputActionDefaultInput = $('#input-action-default-input');

    inputActionInputOptionTemplate = $('#input-action-input-option-container-template');

    urlInputContainer = $('#url-input-container');
    urlInput = $('#url-input');

    useCustomStepUrlContainer = $('#use-custom-step-url-container');
    useCustomStepUrlCheckbox = $('#use-custom-step-url-checkbox');

    customStepUrlContainer = $('#custom-step-url-container');
    customStepUrlInput = $('#custom-step-url-input');


    nextButton = $('#next-button');
    finishButton = $('#finish-button');
    cancelButton = $('#cancel-button');

    $('.common-action .input-action .click-action').hide();
    newTutorialNameInput.show();
    newTutorialNameButton.show();
    newTutorialNameButton.on('click', async () => {
        onNewTutorialNameButtonClicked();
    });





    //------------------------------------------------------------------------------------------------------------
    //MARK: attach listener to inputs------------------------------------------------------
    //------------------------------------------------------------------------------------------------------------
    selectActionTypeSelect.on('change', () => {
        swistchMenu(selectActionTypeSelect.val());
    })

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
                chrome.storage.sync.get(VALUES.STORAGE.CURRENT_URL, result => {
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
        syncStorageSet(VALUES.STORAGE.IS_RECORDING_ACTIONS, checked, () => {
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
        chrome.storage.sync.get([VALUES.STORAGE.CURRENT_SELECTED_ELEMENT], result => {
            const path = result[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT];
            if (!isNotNull(path) || isEmpty(path)) {
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
                    data[VALUES.STORAGE.IS_RECORDING_ACTIONS] = false;

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
})
