class RecordTutorialViewController {
    //Constants
    static #RECORDING_PANEL_HTML_SIMPLE() {
        return `
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
                            <div id="w-recording-panel-is-recording-switch-container" class="w-horizontal-scroll-item-container w-horizontal-scroll-container common-action-container">
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
                    <section id="w-recording-panel-basic-selected-container" class="w-horizontal-scroll-container-orange click-action-container">
                        <!-- selected element -->
                        
                    </section>
                    <section id="w-recording-panel-basic-table-container" class="w-horizontal-scroll-container-orange click-action-container">
                        <!-- parent table -->
                    </section>
                    <section id="w-recording-panel-step-options-container" class="w-horizontal-scroll-container">
                        <!-- step selector -->
                        <div id="sdcs" class="step-option-snapshot-container w-horizontal-scroll-item-container">
                        <!-- snapshot -->
                        <label class="step-option-snapshot-name-label">sckjcsk sc ds dsdssd</label>
                    </div>
                        <div class="w-horizontal-scroll-item-container next-step-button-round-container">
                            <button id="add-new-step-round-button" class="w-round-button">+</button>
                        </div>
                    </section>
                    <section id="w-recording-panel-basic-steps-container" class="w-horizontal-scroll-container-orange">
                        <!-- step selector -->
                        <div class="w-horizontal-scroll-item-container next-step-button-round-container">
                            <button id="add-new-step-round-button" class="w-round-button">+</button>
                        </div>
                    </section>
                    <section id="w-recording-panel-basic-buttons-container">
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
    }
    //UI
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

    //Local Variables
    #isUsingAdvancedRecordingPanel = false
    #hasAdvancedRecordingPanelBeenInitialized = false
    #isRecordingButtonOn = false

    constructor(status) {
        TutorialsModel.tutorialsModelFollowingTutorialDelegate = this
        UserEventListnerHandler.userEventListnerHandlerDelegate = this
        Highlighter.highlighterViewControllerSpecificUIDelegate = this
        this.#initializeUI()
        this.#checkStatus(status)
    }

    #getAllContentHTML() {
        return RecordTutorialViewController.#RECORDING_PANEL_HTML_SIMPLE();
    }

    #initializeUI() {
        const body = $('body');
        body.append(this.#getAllContentHTML());

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
            this.#onCreateNewStep()
        })

        this.stepsContainer = $('#w-recording-panel-basic-steps-container');
        this.addNewStepRoundButton = $('#add-new-step-round-button');
        this.addNewStepRoundButton.on('click', () => {
            this.#onCreateNewStep()
        })

        //advanced
        this.toogleAdvancedRecordingButton = $('.recording-panel-toogle-advanced-button');
        this.toogleAdvancedRecordingButton.on('click', () => {
            this.#onToogleAdvancedRecordingButton()
        })

        this.recordingAdvancedSectionContainer = $('.recording-panel-advanced-section-container').first();

        this.#hideAll();
    }



    async #onToogleAdvancedRecordingButton() {
        if (!this.#isUsingAdvancedRecordingPanel) {
            this.recordingContainer.removeClass('w-recording-panel-container');
            this.recordingContainer.addClass('w-recording-panel-advanced-container');
            this.toogleAdvancedRecordingButton.removeClass('recording-panel-toogle-advanced-button');
            this.toogleAdvancedRecordingButton.addClass('recording-panel-toogle-advanced-button-advanced');
            this.#isUsingAdvancedRecordingPanel = true;

            //load model
            !this.#hasAdvancedRecordingPanelBeenInitialized && TutorialsModel.loadTutorialsOnPageWhenRecording(() => {
                this.#createSnapshotsForAllTutorials()
                this.#hasAdvancedRecordingPanelBeenInitialized = true;
            })
        } else {
            this.recordingContainer.removeClass('w-recording-panel-advanced-container');
            this.recordingContainer.addClass('w-recording-panel-container');
            this.toogleAdvancedRecordingButton.removeClass('recording-panel-toogle-advanced-button-advanced');
            this.toogleAdvancedRecordingButton.addClass('recording-panel-toogle-advanced-button');
            this.#isUsingAdvancedRecordingPanel = false;
        }
    }

    #checkStatus() {
        this.#onCreateNewRecording()
        // chrome.storage.sync.get([VALUES.TUTORIAL_STATUS.STATUS], (result) => {
        //     switch (result[VALUES.TUTORIAL_STATUS.STATUS]) {
        //         case VALUES.TUTORIAL_STATUS.IS_RECORDING:
        //             recordTutorialSwitch.prop('checked', this.#isRecordingButtonOn);
        //             currentTutorialObj = result[VALUES.STORAGE.CURRENT_TUTORIAL_OBJECT];
        //             loadMenuFromStorage(currentTutorialObj);

        //             // const selectedElementPath = result[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT];
        //             // if (isNotNull(selectedElementPath)) {
        //             //     selectedElementIndicator.html(`Selected Element: ${selectedElementPath.slice(max(selectedElementPath.length - 2, 0), selectedElementPath.length)}`)
        //             // } else {
        //             //     selectedElementIndicator.html('Selected Element: None')
        //             // }
        //             // if (isNotNull(result[VALUES.STORAGE.CURRENT_URL])) {
        //             //     customStepUrlInput.val(result[VALUES.STORAGE.CURRENT_URL]);
        //             // }

        //             // showStepContainer();
        //             break;
        //         case VALUES.RECORDING_STATUS.NOT_RECORDING:
        //             syncStorageSet(VALUES.STORAGE.IS_RECORDING, false);
        //             globalCache.globalEventsHandler.setIsRecordingCache(request.isRecordingStatus);
        //             this.#showNewRecordingContainer();
        //             break;
        //         default:
        //             //onStopNewTutorialRecording()
        //             globalCache.globalEventsHandler.setIsRecordingCache(request.isRecordingStatus);
        //             this.#showNewRecordingContainer();
        //             break;
        //     };
        // });
    }

    //TutorialsModelFollowingTutorialDelegate

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
    useInstructionWindow = false
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

        //Highlight
        if (jQElement.is('a')) {
            Highlighter.highlight(jQElement.parent());
        } else {
            Highlighter.highlight(jQElement);
        }

        //update recording panel
        this.#updateSelectedElementDomPathView(globalCache.domPath, nearestTable, nearestTablePath)

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
    }

    #updateSelectedElementDomPathView(path, nearestTable, nearestTablePath) {
        this.selectedElementContainer.empty();

        path.forEach((e, i) => {
            this.selectedElementContainer.append(`
            <div class="selected-item-path-container w-horizontal-scroll-item-container">
                <input class="selected-item-path-input" type="text" id="selected-item-path-${i}" value="${e}">
                <button class="selected-item-path-delete" id="selected-item-path-delete-${i}">&times;</button>
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
                <button class="selected-item-path-delete" id="selected-item-table-path-delete-${i}">&#10006</button>
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
    // #onNewTutorialNameButtonClicked() {
    //     if (newTutorialNameInput.val().length > 1) {
    //         var data = {};
    //         data[VALUES.STORAGE.CURRENT_RECORDING_TUTORIAL_NAME] = newTutorialNameInput.val();
    //         data[VALUES.RECORDING_STATUS.STATUS] = VALUES.RECORDING_STATUS.BEGAN_RECORDING;
    //         data[VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_STEP_INDEX] = 0;
    //         data[VALUES.STORAGE.CURRENT_STEP_OBJ] = null;
    //         data[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT] = null;
    //         data[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE] = null;
    //         syncStorageSetBatch(data);
    //         this.newTutorialNameInput.val('');
    //         this.#showStepContainer();
    //     }
    // }

    // #showStepContainer() {
    //     this.newTutorialContainer.hide();
    //     this.stepDetailsContainer.show();
    // }

    // #showNewRecordingContainer() {
    //     this.stepDetailsContainer.hide();
    //     this.newTutorialContainer.show();
    // }

    // UI Control

    #loadMenuForStep(atIndex) {
        const step = TutorialsModel.getStepOfCurrentTutorialAtIndex(atIndex);
        this.#switchMenu(step.actionType);
        this.#loadMenuItems(step)


    }

    #loadMenuItems(step) {
        this.actionTypeSelector.val(step.actionType);
        this.stepNameInput = step.name
        this.stepDescriptionInput = step.description

        const actionObject = step.actionObject
        Step.callFunctionOnActionType(step.actionType, () => {
            this.#updateSelectedElementDomPathView(actionObject.defaultClick.path)
        }, () => {
            this.#updateSelectedElementDomPathView(actionObject.defaultClick.path)
        }, () => {
            this.#updateSelectedElementDomPathView(actionObject.path);
        }, () => {

        }, () => {
            this.#updateSelectedElementDomPathView(actionObject.path)
        }, () => {
            this.#updateSelectedElementDomPathView(actionObject.path)
        }, () => {

        })
    }


    #switchMenu(selection) {
        this.#switchMenuUIHelper()
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

    #createNewMenu() {
        this.#hideAll()
        this.stepNameInput.val('')
        this.stepDescriptionInput.val('')
    }

    #hideAll() {
        $('.redirect-action-container, .click-action-container, .select-action-container, .common-action-container').hide();
    }

    #showNullMenu() {
        this.#hideAll()
    }

    #switchMenuUIHelper() {
        this.#hideAll()
        $('.common-action-container').show()
    }

    #showClickMenu() {
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
        $('.input-action-container').show();
        //addAlternativeActionButton.html('Add Alternative Input');
    }

    #showClickAndRedirectMenu() {
        //urlInputContainer.show();
    }

    #showRedirectMenu() {
        $('.redirect-action-container').show();
        // selectedElementIndicatorContainer.hide();
        // urlInputContainer.show();
    }

    #showSelectMenu() {
        $('.select-action-container').show();
    }

    #showSideInstructionMenu() {
    }

    //Controller controls
    #onCreateNewRecording() {
        const firstStepId = TutorialsModel.onCreateNewRecording()
        this.#createEmptyStepSnapshot(0, firstStepId)
    }

    #onCreateNewStep(isFirstStep = false) {
        this.#syncCurrentStepFromInput(() => {
            const stepId = TutorialsModel.onCreateNewStep(isFirstStep)
            this.#createEmptyStepSnapshot(TutorialsModel.getCurrentTutorial().steps.length - 1, stepId)
            this.#createNewMenu()
            Highlighter.removeLastHighlight()
        })
    }

    #syncCurrentStepFromInput(callback = () => { }) {
        const currentStep = this.#getStepInfoFromInput(TutorialsModel.getCurrentStepIndex())
        TutorialsModel.saveStep(currentStep, TutorialsModel.getCurrentStepIndex(), () => {
            this.#updateStepSnapshot()
            callback()
        })
    }

    #getStepPathFromInput() {
        var pathArray = []
        this.selectedElementContainer.find('.selected-item-path-container').each((i, element) => {
            pathArray.push($(element).children('input').val())
        })
        return pathArray
    }

    #getStepInfoFromInput(atIndex) {
        const stepId = TutorialsModel.getCurrentStep().id
        const actionType = parseInt(this.actionTypeSelector.val())
        const selectedElementPath = this.#getStepPathFromInput()
        var actionObject = Step.callFunctionOnActionType(actionType, () => {
            return new ClickAction(new ClickGuide(selectedElementPath, null, null, false, null, false, null), []);
        }, () => {
            return new ClickAction(new ClickGuide(selectedElementPath, null, null, true, null, false, null), []);
        }, () => {
            return new InputAction(selectedElementPath, "", [], false, VALUES.INPUT_TYPES.TEXT);
        }, () => {
            return new RedirectAction(null);
        }, () => {
            return new SelectAction(selectedElementPath, null, false);
        }, () => {
            return new SideInstructionAction(selectedElementPath);
        }, () => {
            return new NullAction();
        })
        var step = new Step(atIndex, actionType, actionObject, this.stepNameInput.val(), this.stepDescriptionInput.val(), null, null, [], stepId)
        c('synced from UI: ' + JSON.stringify(step))
        return step
    }

    // #endRecordingCurrentTutorial() {
    //     var data = {};
    //     data[VALUES.RECORDING_STATUS.STATUS] = VALUES.RECORDING_STATUS.NOT_RECORDING;
    //     data[VALUES.STORAGE.IS_RECORDING] = false;
    //     data[VALUES.STORAGE.CURRENT_RECORDING_TUTORIAL_NAME] = null;
    //     data[VALUES.STORAGE.CURRENT_STEP_OBJ] = null;
    //     data[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT] = null;
    //     data[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE] = null;
    //     data[VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID] = null;
    //     data[VALUES.STORAGE.STEP_ACTION_TYPE] = VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL;
    //     sendMessageToContentScript({ isRecordingStatus: false });
    //     syncStorageSetBatch(data);
    //     this.#showNewRecordingContainer();
    // }

    //UI functions
    #createEmptyStepSnapshot(atIndex, id) {
        const type = SnapshotView.TYPE.RECORDING_STEP
        const snapshotHTML = SnapshotView.getViewHTML({ type, id })
        jQueryinsertAt($('#w-recording-panel-basic-steps-container'), atIndex, snapshotHTML)
        SnapshotView.addHoverListener(id, type)
        SnapshotView.addClickListener(id, this.#onSnapshotClicked.bind(this))
    }

    #onSnapshotClicked(id) {
        const index = SnapshotView.getSnapshotIndex(id)
        this.#loadMenuForStep(index)
        TutorialsModel.changeCurrentTutorialStepIndexTo(index)
    }




    #createStepSnapshot(atIndex, snapshot) {
        const steps = TutorialsModel.getCurrentTutorial().steps;
        const prevStep = steps[atIndex - 1] || null;
        const nextStep = steps[atIndex] || null;
        const trimmedURL = snapshot.url;

        const type = SnapshotView.TYPE.RECORDING_STEP
        const snapshotHTML = SnapshotView.getViewHTML(snapshot)
        const id = snapshot.id
        SnapshotView.addHoverListener(id, type)
        SnapshotView.addClickListener(id, this.#onSnapshotClicked.bind(this))

        console.log(JSON.stringify(prevStep))
        if (isNotNull(prevStep) && prevStep.url === snapshot.url) {
            console.log('apending step snapshot')
            const container = $(`#${prevStep.id}`).parent();
            container.append(snapshotHTML)
        } else if (isNotNull(nextStep) && nextStep.url === snapshot.url) {
            console.log('prepending step snapshot')
            const container = $(`#${nextStep.id}`).parent();
            container.prepend(snapshotHTML)
        } else {
            console.log('appending page contaner')
            this.addNewStepRoundButton.parent().before(`
            <div class="w-recording-panel-steps-section-container w-horizontal-scroll-item-container">
                <div class="w-recording-panel-steps-page-indicator-container">
                ${trimmedURL}
                </div>
                ${snapshotHTML}
            </div>
            `);
        }
    }

    #updateStepSnapshot() {
        const step = TutorialsModel.getCurrentStep()
        const stepSnapshotView = $(`#${step.id}`)
        stepSnapshotView.find('.step-snapshot-name-label').html(`${step.name}`)
        stepSnapshotView.find('.step-snapshot-description-label').html(`${step.description}`)
    }

    //Adcanced actions

    #createSnapshotsForAllTutorials() {
        TutorialsModel.forEachTutorial((tutorial, index) => {
            this.#createSnapshotsForTutorial(tutorial)
        })
    }

    #createSnapshotsForTutorial(tutorial) {
        tutorial.steps.forEach((step, index) => {
            c(step)
            if (step.url === globalCache.currentUrl) {
                if (index !== 0) {
                    this.#createSnapshotForStep(tutorial.id, step)
                } else {
                    this.#createSnapshotForTutorialTitle(tutorial)
                    this.#createSnapshotForStep(tutorial.id, step)

                }
            }
        })
        document.querySelectorAll('.step-snapshot-container').forEach(element => {
            //drag and drop handler
            element.usePlaceholder = true
            DragAndDropHandler.addDragListenerToElement(element)
            DragAndDropHandler.dropHandlerDelegate = window
            //mouse over handler

        });
    }

    #createSnapshotForTutorialTitle(tutorial) {
        this.recordingAdvancedSectionContainer.append(`
        <div class="w-horizontal-scroll-container-orange w-recording-panel-advanced-steps-container">
            <div
                class="w-horizontal-scroll-item-container w-recording-advanced-panel-steps-section-container w-horizontal-scroll-container">
                <div id="tutorial-recording-snapshot-${tutorial.id}" class="step-snapshot-container w-horizontal-scroll-item-container">
                    <!-- snapshot -->
                    ${tutorial.name}
                </div>
        </div>
        `);
    }

    #createSnapshotForStep(tutorialId, step) {
        c(step)
        const container = $(`#tutorial-recording-snapshot-${tutorialId}`).parent().parent();
        step.type = SnapshotView.TYPE.STEP_FROM_OTHER
        container.append(SnapshotView.getViewHTML(step))
        const element = document.getElementById(step.id)
        element.addEventListener("mouseenter", () => {
            Highlighter.highlight(Step.getPath(step))
        })
        element.addEventListener("mouseleave", () => {
            Highlighter.removeLastHighlight()
        })
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

    async #addStepToFirebase(step) {
        chrome.storage.sync.get(VALUES.RECORDING_STATUS.STATUS, async (result) => {
            switch (result[VALUES.RECORDING_STATUS.STATUS]) {
                case VALUES.RECORDING_STATUS.BEGAN_RECORDING:
                    await postDocToFirebase(
                        step,
                        VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL,
                        VALUES.RECORDING_STATUS.BEGAN_RECORDING
                    ).then(() => {
                        syncStorageSet(VALUES.RECORDING_STATUS.STATUS, VALUES.RECORDING_STATUS.RECORDING);
                    })
                    break;
                case VALUES.RECORDING_STATUS.RECORDING:
                    await postDocToFirebase(
                        step,
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