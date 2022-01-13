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
        TutorialsModel.tutorialsModelFollowingTutorialDelegate = this
        UserEventListnerHandler.userEventListnerHandlerDelegate = this
        Highlighter.highlighterViewControllerSpecificUIDelegate = this
        this.#initializeUI()
        //this.#checkStatus(status)
    }

    #initializeUI() {
        const body = $('body');
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

        this.recordingContainer = $('.w-recording-panel-container').first();

        this.recordingMenuDraggableArea = $('#w-recording-menu-draggable-area');
        makeElementDraggable(this.recordingMenuDraggableArea[0], this.recordingContainer[0]);

        this.recordTutorialSwitch = $('#record-tutorial-switch');
        this.recordTutorialSwitch.on('change', () => {
            const checked = this.recordTutorialSwitch.prop('checked');
            if (checked) {
                UserEventListnerHandler.setTutorialStatusCache(VALUES.TUTORIAL_STATUS.IS_RECORDING);
            } else {
                UserEventListnerHandler.setTutorialStatusCache(VALUES.TUTORIAL_STATUS.LOADED);
            }
        })

        this.actionTypeSelector = $('#select-action-type-select');
        this.actionTypeSelector.on('change', () => {
            const selection = parseInt(this.actionTypeSelector.val());
            this.#switchMenu(selection);
        })

        this.recordUpperContainer = $('#w-recording-panel-basic-upper-content-container');
        this.stepNameInput = $('#step-name-input');
        this.stepDescriptionInput = $('#step-description-input');
        this.stepCustomURLInput = $('#step-custom-url-input');
        this.stepRedirectURLInput = $('#step-redirect-url-input');
        this.stepAltClickInput = $('#step-alt-click-description-input');

        this.stepNameInput.on("keyup", () => {
            this.stepNameInput.attr("value", this.stepNameInput.val());
        });

        this.stepDescriptionInput.on("keyup", () => {
            this.stepDescriptionInput.attr("value", this.stepDescriptionInput.val());
        });

        this.stepCustomURLInput.on("keyup", () => {
            this.stepCustomURLInput.attr("value", this.stepCustomURLInput.val());
        });

        this.stepRedirectURLInput.on("keyup", () => {
            this.stepRedirectURLInput.attr("value", this.stepRedirectURLInput.val());
        });

        this.stepAltClickInput.on("keyup", () => {
            this.stepAltClickInput.attr("value", this.stepAltClickInput.val());
        });


        this.selectedElementContainer = $('#w-recording-panel-basic-selected-container');
        this.selectedTableContainer = $('#w-recording-panel-basic-table-container');

        this.createNewStepButton = $('#create-new-step-button');
        this.createNewStepButton.on('click', () => {
            //TutorialsModel.onCreatingNewStep();
        })

        this.stepsContainer = $('#w-recording-panel-basic-steps-container');
        this.addNewStepRoundButton = $('#add-new-step-round-button');


        //advanced
        this.toogleAdvancedRecordingButton = $('.recording-panel-toogle-advanced-button');
        this.toogleAdvancedRecordingButton.on('click', () => {
            if (!globalCache.isUsingAdvancedRecordingPanel) {
                this.recordingContainer.removeClass('w-recording-panel-container');
                this.recordingContainer.addClass('w-recording-panel-advanced-container');
                this.toogleAdvancedRecordingButton.removeClass('recording-panel-toogle-advanced-button');
                this.toogleAdvancedRecordingButton.addClass('recording-panel-toogle-advanced-button-advanced');
                globalCache.isUsingAdvancedRecordingPanel = true;
            } else {
                this.recordingContainer.removeClass('w-recording-panel-advanced-container');
                this.recordingContainer.addClass('w-recording-panel-container');
                this.toogleAdvancedRecordingButton.removeClass('recording-panel-toogle-advanced-button-advanced');
                this.toogleAdvancedRecordingButton.addClass('recording-panel-toogle-advanced-button');
                globalCache.isUsingAdvancedRecordingPanel = false;
            }
        })

        this.recordingAdvancedSectionContainer = $('.recording-panel-advanced-section-container').first();

        this.#clearCurrentMenu();
    }

    //TutorialsModelFollowingTutorialDelegate
    makeButtonFromTutorialData(tutorialData, tutorialID) {

    }

    //UserEventListnerHandlerDelegate
    onClick() {
        if (UserEventListnerHandler.isLisentingRecording) {
            this.#onClickWhenRecording();
        }
    }

    checkIfShouldPreventDefault(event) {
        return UserEventListnerHandler.isLisentingRecording && !$.contains(this.recordingContainer[0], event.target)
    }

    checkIfShouldProcessEvent(event) {
        return (event.target !== globalCache.currentElement &&
            !$.contains(this.recordingContainer[0], event.target))
    }

    //HighlighterViewControllerSpecificUIDelegate
    useInstructionWindow = true
    //highlightInstructionWindow has been declared in UI section
    updateStepInstructionUIHelper() {
        // if (isEmpty(TutorialsModel.getCurrentStep().name)) {
        //     TutorialsModel.getCurrentStep().name = `Step ${TutorialsModel.getCurrentStep().index}`;
        // }
        // if (isEmpty(TutorialsModel.getCurrentStep().description)) {
        //     TutorialsModel.getCurrentStep().description = `Select the highlighted box`;
        // }
        // this.popUpStepName.html(TutorialsModel.getCurrentStep().name);
        // this.popUpStepDescription.html(TutorialsModel.getCurrentStep().description);
    }

    highlightedElementNotFoundHandler() {
        // const firstStepOnPageIndex = TutorialsModel.getFirstStepIndexOnCurrentPage();
        // if (firstStepOnPageIndex > -1) {
        //     this.#switchToAndShowStepAtIndex(firstStepOnPageIndex);
        //     if (TutorialsModel.getCurrentStep().possibleReasonsForElementNotFound.length > 0) {
        //         //show in highlight instruction window why might the cause of error be
        //     }
        // }
    }

    #onClickWhenRecording() {
        //get element
        const jQElement = $(globalCache.currentElement);
        syncStorageSet(VALUES.STORAGE.CURRENT_SELECTED_ELEMENT, globalCache.domPath);

        let nearestTable
        var nearestTablePath
        storeSelectedElementOrNearestTableIfExists()
        function storeSelectedElementOrNearestTableIfExists() {
            nearestTable = getNearestTableOrList(jQElement[0]);
            if (!isNotNull(nearestTable)) {
                syncStorageSet(VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE, null);
            } else {
                nearestTablePath = getShortDomPathStack(nearestTable)
                if ($(jqueryElementStringFromDomPath(nearestTablePath)).length > 1) {
                    nearestTablePath = getCompleteDomPathStack(nearestTable);
                }
                syncStorageSet(VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE, nearestTablePath);
            }
        }

        //Highlight
        if (jQElement.is('a')) {
            Highlighter.highlightAndRemoveLastHighlight(jQElement.parent());
        } else {
            Highlighter.highlightAndRemoveLastHighlight(jQElement);
        }

        //update recording panel
        this.selectedElementContainer.empty();

        globalCache.domPath.forEach((e, i) => {
            this.selectedElementContainer.append(`
            <div class="selected-item-path-container w-horizontal-scroll-item-container">
                <input class="selected-item-path-input" type="text" id="selected-item-path-${i}" value="${e}">
                <button class="selected-item-path-delete" id="selected-item-path-delete-${i}">x</button>
            </div>
            <div class="w-horizontal-scroll-item-next-indicator-container w-horizontal-scroll-item-container">
                <div class="w-horizontal-scroll-item-next-indicator">
                </div>
            </div>
            `);
        })

        this.selectedTableContainer.empty();
        isNotNull(nearestTable) && nearestTablePath.forEach((e, i) => {
            this.selectedTableContainer.append(`
            <div class="selected-item-path-container w-horizontal-scroll-item-container">
                <input class="selected-item-path-input" type="text" id="selected-item-table-path-${i}" value="${e}">
                <button class="selected-item-path-delete" id="selected-item-table-path-delete-${i}">x</button>
            </div>
            <div class="w-horizontal-scroll-item-next-indicator-container w-horizontal-scroll-item-container">
                <div class="w-horizontal-scroll-item-next-indicator">
                </div>
            </div>
            `);
        })


    }

    //------------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------------
    //MARK: recording menu
    //------------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------------
    #onNewTutorialNameButtonClicked() {
        if (newTutorialNameInput.val().length > 1) {
            var data = {};
            data[VALUES.STORAGE.CURRENT_RECORDING_TUTORIAL_NAME] = newTutorialNameInput.val();
            data[VALUES.RECORDING_STATUS.STATUS] = VALUES.RECORDING_STATUS.BEGAN_RECORDING;
            data[VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_STEP_INDEX] = 0;
            data[VALUES.STORAGE.CURRENT_STEP_OBJ] = null;
            data[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT] = null;
            data[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE] = null;
            syncStorageSetBatch(data);
            this.newTutorialNameInput.val('');
            this.#showStepContainer();
        }
    }

    //MARK: Set up menu if needed
    #showStepContainer() {
        this.newTutorialContainer.hide();
        this.stepDetailsContainer.show();
    }

    #showNewRecordingContainer() {
        this.stepDetailsContainer.hide();
        this.newTutorialContainer.show();
    }

    #checkStatus() {
        chrome.storage.sync.get([VALUES.TUTORIAL_STATUS.STATUS], (result) => {
            switch (result[VALUES.TUTORIAL_STATUS.STATUS]) {
                case VALUES.TUTORIAL_STATUS.IS_RECORDING:
                    recordTutorialSwitch.prop('checked', globalCache.isRecordingButtonOn);
                    currentTutorialObj = result[VALUES.STORAGE.CURRENT_TUTORIAL_OBJECT];
                    loadMenuFromStorage(currentTutorialObj);

                    // const selectedElementPath = result[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT];
                    // if (isNotNull(selectedElementPath)) {
                    //     selectedElementIndicator.html(`Selected Element: ${selectedElementPath.slice(max(selectedElementPath.length - 2, 0), selectedElementPath.length)}`)
                    // } else {
                    //     selectedElementIndicator.html('Selected Element: None')
                    // }
                    // if (isNotNull(result[VALUES.STORAGE.CURRENT_URL])) {
                    //     customStepUrlInput.val(result[VALUES.STORAGE.CURRENT_URL]);
                    // }

                    // showStepContainer();
                    break;
                case VALUES.RECORDING_STATUS.NOT_RECORDING:
                    syncStorageSet(VALUES.STORAGE.IS_RECORDING, false);
                    globalCache.globalEventsHandler.setIsRecordingCache(request.isRecordingStatus);
                    this.#showNewRecordingContainer();
                    break;
                default:
                    //onStopNewTutorialRecording()
                    globalCache.globalEventsHandler.setIsRecordingCache(request.isRecordingStatus);
                    this.#showNewRecordingContainer();
                    break;
            };
        });
    }

    #loadMenuFromStorage(currentTutorialObj) {
        if (isNotNull(currentTutorialObj)) {
            //switchMenu(currentTutorialObj.steps[currentTutorialObj.cu].actionType);
            //selectActionTypeSelect.val(currentStepObj.actionType);
            // if (isNotNull(currentStepObj.url)) {
            //     useCustomStepUrlCheckbox.prop('checked', true);
            //     customStepUrlContainer.show();
            //     customStepUrlInput.val(currentStepObj.url);
            // }
            currentTutorialObj.updateUIForCurrentStep();
        } else {
            switchMenu(VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL);
            selectActionTypeSelect.val(VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL);
        }
    }


    #switchMenu(selection) {
        Step.callFunctionOnActionType(
            selection,
            this.#showClickMenu.bind(this),
            this.#showClickAndRedirectMenu.bind(this),
            this.#showInputMenu.bind(this),
            this.#showRedirectMenu.bind(this),
            this.#showSelectMenu.bind(this),
            this.#showSideInstructionMenu.bind(this),
            this.#showNullMenu.bind(this)
        );
    }

    #loadMenuItems(selection) {
        Step.callFunctionOnActionType(
            selection,
            () => {
                //click
                this.clickActionNameInput.val(currentStepObj.actionObject.defaultClick.name);
                this.clickActionDescriptionInput.val(currentStepObj.actionObject.defaultClick.description);
            }, () => {
                //car
                this.urlInput.val(currentStepObj.actionObject.defaultClick.url);
            }, () => {
                //input
                this.inputActionDefaultInput.val(currentStepObj.actionObject.defaultText)
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
    #clearCurrentMenu() {
        $('.redirect-action-container, .click-action-container, .select-action-container').hide();
    }

    #showNullMenu() {
        this.#clearCurrentMenu()
    }

    #showClickMenu() {
        this.#clearCurrentMenu();
        $('.click-action-container').show();
        // addAlternativeActionButton.html('Add Alternative Click');

        // chrome.storage.sync.get(VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE, result => {
        //     const table = result[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE];
        //     if (!isNotNull(table)) {
        //     } else {
        //         useAnyElementInTableInput.val(table)
        //     }
        // })
    }

    #showInputMenu() {
        this.#clearCurrentMenu();
        $('.input-action-container').show();
        //addAlternativeActionButton.html('Add Alternative Input');
    }

    #showClickAndRedirectMenu() {
        this.#clearCurrentMenu();
        //urlInputContainer.show();
    }

    #showRedirectMenu() {
        this.#clearCurrentMenu();
        $('.redirect-action-container').show();
        // selectedElementIndicatorContainer.hide();
        // urlInputContainer.show();
    }

    #showSelectMenu() {
        this.#clearCurrentMenu();
        $('.select-action-container').show();
    }

    #showSideInstructionMenu() {
        this.#clearCurrentMenu();
    }



    #endRecordingHelper() {
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
        this.#showNewRecordingContainer();
    }
    //------------------------------------------------------------------------------------------------------------
    //MARK: Firebase actions------------------------------------------------------
    //------------------------------------------------------------------------------------------------------------
    async #deleteDocIfExists() {
        chrome.storage.sync.get(VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID, async (result) => {
            const docId = result[VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID];
            if (isNotNull(docId)) {
                const tutorialRef = doc(ExtensionController.FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL, docId);
                await deleteDoc(tutorialRef);
            }
        })
    }

    async #addStepToFirebase(stepObj) {
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

    async #postDocToFirebase(stepObj, type, status) {
        var docId;
        var stepIndex = 0;
        try {
            switch (status) {
                case VALUES.RECORDING_STATUS.BEGAN_RECORDING:
                    chrome.storage.sync.get([VALUES.STORAGE.CURRENT_RECORDING_TUTORIAL_NAME, VALUES.STORAGE.CURRENT_URL], async result => {
                        const docRef = await addDoc(collection(ExtensionController.FIRESTORE_REF, type), {
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

                await addDoc(collection(ExtensionController.FIRESTORE_REF, type, docId, "Steps"), JSON.parse(JSON.stringify(stepObj)));
                const tutorialRef = doc(ExtensionController.FIRESTORE_REF, type, docId);
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

    dismiss() {

    }
}