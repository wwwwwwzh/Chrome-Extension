class RecordTutorialViewController {
    recordingContainer;
    recordingMenuDraggableArea;

    recordTutorialSwitch;
    actionTypeSelector;

    recordUpperContainer;

    stepNameInput;
    stepDescriptionInput;
    stepCustomURLInput;
    stepAltClickInput;
    stepRedirectURLInput;


    selectedElementContainer;
    selectedTableContainer;

    stepsContainer;
    addNewStepRoundButton;

    createNewStepButton;

    toogleAdvancedRecordingButton;
    recordingAdvancedSectionContainer;

    constructor(status) {

        (() => { this.#loadRecordingPanel() })
    }

    #loadRecordingPanel() {
        body.append(`
            <div class="w-recording-panel-container">
                <div id="w-recording-menu-draggable-area" class="w-common-item w-popup-draggable"></div>
                <div class="w-recording-panel-main-container">
                    <!-- basic panel -->
                    <section id="w-recording-panel-basic-upper-container">
                        <!-- upper panel -->
                        <div class="w-horizontal-scroll-container" id="w-recording-panel-basic-upper-header">
                            <!-- header --> 
                            <div id="select-action-type-container" class="w-horizontal-scroll-item-container">
                                <select name="action-type" id="select-action-type-select">
                                    <option value="${VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL}">Select Step Type</option>
                                    <option value="${VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_REDIRECT}">Redirect (Open another page directly)</option>
                                    <!-- <option value="${VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK_REDIRECT}">Click and redirect (Open another page by clicking)</option> -->
                                    <option value="${VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK}">Click</option>
                                    <option value="${VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_INPUT}">Input</option>
                                    <!-- <option value="${VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_SELECT}">Select</option> -->
                                    <option value="${VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_SIDE_INSTRUCTION}">Instruction</option>
                                </select>
                            </div>
                            <div id="w-recording-panel-is-recording-switch-container" class="w-horizontal-scroll-item-container w-horizontal-scroll-container">
                                <p id="is-recording-indicator" class="w-horizontal-scroll-item-container">Not Recording</p>
                                <label id="is-recording-switch-label" class="w-horizontal-scroll-item-container">
                                    <input type="checkbox" id="record-tutorial-switch">
                                    <span id="is-recording-switch-slider"></span>
                                </label>
                            </div>
                        </div>
                        <div id="w-recording-panel-basic-upper-content-container" class="w-horizontal-scroll-container">
                            <!-- content -->
                            <div id="w-recording-panel-basic-upper-left" class="w-horizontal-scroll-item-container">
                                <!-- left -->
                                <div class="w-material-input-container common-action-container">
                                    <input class="w-material-input" id="step-name-input" type="text" autocomplete="off" value="">
                                    <label class="w-material-input-placeholder-text">
                                        <div class="w-material-input-text">Step Name</div>
                                    </label>
                                </div>
                                <div class="w-material-input-container common-action-container">
                                    <input class="w-material-input" id="step-description-input" type="text" autocomplete="off" value="">
                                    <label class="w-material-input-placeholder-text">
                                        <div class="w-material-input-text">Step Description</div>
                                    </label>
                                </div>
                                <div class="w-material-input-container common-action-container">
                                    <input class="w-material-input" id="step-custom-url-input" type="text" autocomplete="off" value="">
                                    <label class="w-material-input-placeholder-text">
                                        <div class="w-material-input-text">Custom URL</div>
                                    </label>
                                </div>
                            </div>
                            <div id="w-recording-panel-basic-upper-right" class="w-horizontal-scroll-item-container">
                                <!-- right -->
                                <div class="w-material-input-container redirect-action-container">
                                    <input class="w-material-input" id="step-redirect-url-input" type="text" autocomplete="off" value="">
                                    <label class="w-material-input-placeholder-text">
                                        <div class="w-material-input-text">Redirect URL</div>
                                    </label>
                                </div>
                                <div class="w-material-input-container click-action-container">
                                    <input class="w-material-input" id="step-alt-click-description-input" type="text" autocomplete="off" value="">
                                    <label class="w-material-input-placeholder-text">
                                        <div class="w-material-input-text">Alternative Click Description</div>
                                    </label>
                                </div>
                                <div class="w-material-input-container select-action-container">
                                    <input class="w-material-input" id="step-xxx-input" type="text" autocomplete="off" value="">
                                    <label class="w-material-input-placeholder-text">
                                        <div class="w-material-input-text">...</div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section id="w-recording-panel-basic-selected-container" class="w-horizontal-scroll-container click-action-container">
                        <!-- selected element -->
                        
                    </section>
                    <section id="w-recording-panel-basic-table-container" class="w-horizontal-scroll-container click-action-container">
                        <!-- parent table -->
                    </section>
                    <section id="w-recording-panel-basic-steps-container" class="w-horizontal-scroll-container common-action-container">
                        <!-- step selector -->
                        <div class="next-step-button-round-container w-horizontal-scroll-item-container">
                            <button id="add-new-step-round-button" class="w-round-button">+</button>
                        </div>
                    </section>
                    <section id="w-recording-panel-basic-buttons-container common-action-container">
                        <!-- buttons -->
                        <button id="create-new-step-button">New Step</button>
                    </section>
                </div>
                <section class="recording-panel-advanced-section-container">
                    <!-- advanced operations -->
                </section>
                <button class="recording-panel-toogle-advanced-button">
                    <p class="verticle-text">Advanced</p>
                </button>
            </div>
            `
        );

        recordingContainer = $('.w-recording-panel-container').first();


        recordingMenuDraggableArea = $('#w-recording-menu-draggable-area');
        makeElementDraggable(recordingMenuDraggableArea[0], recordingContainer[0]);

        recordTutorialSwitch = $('#record-tutorial-switch');
        recordTutorialSwitch.on('change', () => {
            const checked = recordTutorialSwitch.prop('checked');
            if (checked) {
                globalCache.globalEventsHandler.setTutorialStatusCache(VALUES.TUTORIAL_STATUS.IS_RECORDING);
            } else {
                globalCache.globalEventsHandler.setTutorialStatusCache(VALUES.TUTORIAL_STATUS.LOADED);
            }
        })

        actionTypeSelector = $('#select-action-type-select');
        actionTypeSelector.on('change', () => {
            const selection = parseInt(actionTypeSelector.val());
            switchMenu(selection);
        })

        recordUpperContainer = $('#w-recording-panel-basic-upper-content-container');

        stepNameInput = $('#step-name-input');
        stepDescriptionInput = $('#step-description-input');
        stepCustomURLInput = $('#step-custom-url-input');
        stepRedirectURLInput = $('#step-redirect-url-input');
        stepAltClickInput = $('#step-alt-click-description-input');

        stepNameInput.on("keyup", () => {
            stepNameInput.attr("value", stepNameInput.val());
        });

        stepDescriptionInput.on("keyup", () => {
            stepDescriptionInput.attr("value", stepDescriptionInput.val());
        });

        stepCustomURLInput.on("keyup", () => {
            stepCustomURLInput.attr("value", stepCustomURLInput.val());
        });

        stepRedirectURLInput.on("keyup", () => {
            stepRedirectURLInput.attr("value", stepRedirectURLInput.val());
        });

        stepAltClickInput.on("keyup", () => {
            stepAltClickInput.attr("value", stepAltClickInput.val());
        });


        selectedElementContainer = $('#w-recording-panel-basic-selected-container');
        selectedTableContainer = $('#w-recording-panel-basic-table-container');

        createNewStepButton = $('#create-new-step-button');
        createNewStepButton.on('click', () => {
            tutorialsManager.onCreatingNewStep();
        })

        stepsContainer = $('#w-recording-panel-basic-steps-container');
        addNewStepRoundButton = $('#add-new-step-round-button');


        //advanced
        toogleAdvancedRecordingButton = $('.recording-panel-toogle-advanced-button');
        toogleAdvancedRecordingButton.on('click', () => {
            if (!globalCache.isUsingAdvancedRecordingPanel) {
                recordingContainer.removeClass('w-recording-panel-container');
                recordingContainer.addClass('w-recording-panel-advanced-container');
                toogleAdvancedRecordingButton.removeClass('recording-panel-toogle-advanced-button');
                toogleAdvancedRecordingButton.addClass('recording-panel-toogle-advanced-button-advanced');
                globalCache.isUsingAdvancedRecordingPanel = true;
            } else {
                recordingContainer.removeClass('w-recording-panel-advanced-container');
                recordingContainer.addClass('w-recording-panel-container');
                toogleAdvancedRecordingButton.removeClass('recording-panel-toogle-advanced-button-advanced');
                toogleAdvancedRecordingButton.addClass('recording-panel-toogle-advanced-button');
                globalCache.isUsingAdvancedRecordingPanel = false;
            }
        })

        recordingAdvancedSectionContainer = $('.recording-panel-advanced-section-container').first();


        clearCurrentMenu();


        // //------------------------------------------------------------------------------------------------------------
        // //MARK: button events------------------------------------------------------------------------------------------------------------
        // //------------------------------------------------------------------------------------------------------------
        // recordTutorialSwitch.on('change', () => {
        //     const checked = recordTutorialSwitch.prop('checked');
        //     syncStorageSet(VALUES.STORAGE.IS_RECORDING_ACTIONS, checked, () => {
        //         $('h3').html(checked ? "Recording" : "Not Recording");
        //         sendMessageToContentScript({ isRecordingStatus: checked });
        //     })
        // })

        // addAlternativeActionButton.on('click', () => {
        //     let inputContainer = document.querySelector('.input-action-input-option-container-template').cloneNode(true);
        //     inputContainer.setAttribute('id', inputActionInputOptionTemplate.attr('id'));
        //     document.getElementById('input-action-input-options-container').appendChild(inputContainer);
        //     // inputContainer.querySelector('.input-action-input-options').addEventListener("input", event => {
        //     //     const value = event.target.value;
        //     // });
        //     inputContainer.querySelector('.input-action-input-options-delete').addEventListener("click", () => {
        //         inputContainer.remove();
        //     });
        //     inputContainer.hidden = false;
        // })



        // nextButton.on('click', async () => {
        //     onNextButtonClicked();
        // })

        // async function onNextButtonClicked() {
        //     chrome.storage.sync.get([VALUES.STORAGE.CURRENT_SELECTED_ELEMENT], result => {
        //         const path = result[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT];
        //         if (!isNotNull(path) || isEmpty(path)) {
        //             alert("Please complete required fields first");
        //             return;
        //         }
        //         callFunctionOnActionType(
        //             currentStepObj.actionType,
        //             () => {
        //                 //click
        //                 currentStepObj.actionObject.defaultClick.path = path;
        //             }, () => {
        //                 //car
        //                 currentStepObj.actionObject.defaultClick.path = path;
        //             }, () => {
        //                 //input
        //                 //TODO: find input type
        //                 currentStepObj.actionObject.inputType = "text";
        //                 currentStepObj.actionObject.path = path;
        //                 document.querySelectorAll('.input-action-input-option-container-template').forEach((element, currentIndex, listObj) => {
        //                     currentStepObj.actionObject.optionsText.push(element.querySelector('.input-action-input-options').value);
        //                 })
        //             }, null, () => {
        //                 //select
        //                 const selectPath = path.slice(0, path.length - 1);
        //                 const selectedElement = $(jqueryElementStringFromDomPath(selectPath));
        //                 currentStepObj.actionObject.path = selectPath;
        //                 currentStepObj.actionObject.defaultValue = selectedElement.val();
        //             }, () => {
        //                 //instruction
        //                 currentStepObj.actionObject.path = path;
        //             });

        //         //check if step is complete
        //         if (isStepCompleted(currentStepObj)) {
        //             //upload to firebase
        //             addStepToFirebase(currentStepObj).then(() => {
        //                 var data = {};
        //                 data[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT] = null;
        //                 data[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE] = null;
        //                 data[VALUES.STORAGE.IS_RECORDING_ACTIONS] = false;

        //                 syncStorageSetBatch(data, () => {
        //                     useAnyElementInTableInput.val('');
        //                     selectedElementIndicator.html('Selected Element: None');
        //                     recordTutorialSwitch.prop('checked', false);
        //                     //refresh menu
        //                     updateCurrentStep(() => { currentStepObj = null; })
        //                     loadMenuFromStorage(null);

        //                     //auto click the recorded element
        //                     sendMessageToContentScript({ clickPath: path, isRecordingStatus: false, removeHighlight: true });
        //                 });
        //             })
        //         } else {
        //             alert("Please complete required fields first");
        //         }
        //     })
        // }

        // finishButton.on('click', async () => {
        //     endRecordingHelper();
        // })

        // //TODO: cancel should delete current document if it exists
        // cancelButton.on('click', async () => {
        //     deleteDocIfExists().then(() => {
        //         endRecordingHelper();
        //     });
        // })
    }
}