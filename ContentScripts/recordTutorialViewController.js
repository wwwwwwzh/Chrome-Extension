class RecordTutorialViewController {
    //Constants
    static #RECORDING_PANEL_HTML_SIMPLE() {
        return `
            <div id="w-recording-panel-container" class="w-recording-panel-container-normal">
                <link rel="stylesheet" href="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.css">
                <div id="w-recording-menu-draggable-area" class="w-common-item w-popup-draggable"></div>
                <div class="w-recording-panel-main-container">
                    <!-- basic panel -->
                    <section id="w-recording-panel-basic-upper-container">
                        <label id="tutorial-name-input-container" class="w-material-input-container recording-full-width tutorial-action-container mdc-text-field mdc-text-field--outlined">
                            <span class="mdc-notched-outline">
                                <span class="mdc-notched-outline__leading"></span>
                                <span class="mdc-notched-outline__notch">
                                    <span class="mdc-floating-label" id="my-label-id">Tutorial Name</span>
                                </span>
                                <span class="mdc-notched-outline__trailing"></span>
                            </span>
                            <input id="tutorial-name-input" type="text" class="w-material-input mdc-text-field__input" aria-labelledby="my-label-id" >
                        </label>
                        <label id="tutorial-description-input-container" class="w-material-input-container recording-full-width tutorial-action-container mdc-text-field mdc-text-field--outlined mdc-text-field--textarea mdc-text-field--no-label">
                            <span class="mdc-notched-outline">
                                <span class="mdc-notched-outline__leading"></span>
                                <span class="mdc-notched-outline__notch">
                                    <span class="mdc-floating-label" id="my-label-id">Tutorial Description</span>
                                </span>
                                <span class="mdc-notched-outline__trailing"></span>
                            </span>
                            <span class="mdc-text-field__resizer">
                                <textarea id="tutorial-description-input" class="mdc-text-field__input" rows="8" cols="40" aria-label="Label"></textarea>
                            </span>
                        </label>

                        <label id="step-name-input-container" class="w-material-input-container recording-full-width common-action-container mdc-text-field mdc-text-field--outlined">
                            <span class="mdc-notched-outline">
                                <span class="mdc-notched-outline__leading"></span>
                                <span class="mdc-notched-outline__notch">
                                    <span class="mdc-floating-label" id="my-label-id">Step Name</span>
                                </span>
                                <span class="mdc-notched-outline__trailing"></span>
                            </span>
                            <input id="step-name-input" type="text" class="w-material-input mdc-text-field__input" aria-labelledby="my-label-id" >
                        </label>
                        <label id="step-description-input-container" class="w-material-input-container recording-full-width common-action-container mdc-text-field mdc-text-field--outlined mdc-text-field--textarea mdc-text-field--no-label">
                            <span class="mdc-notched-outline">
                                <span class="mdc-notched-outline__leading"></span>
                                <span class="mdc-notched-outline__notch">
                                    <span class="mdc-floating-label" id="my-label-id">Step Description</span>
                                </span>
                                <span class="mdc-notched-outline__trailing"></span>
                            </span>
                            <span class="mdc-text-field__resizer">
                                <textarea id="step-description-input" class="mdc-text-field__input" rows="8" cols="40" aria-label="Label"></textarea>
                            </span>
                        </label>
                        <div class="w-horizontal-container recording-full-width">
                            <div id="select-action-type-container" class="w-horizontal-item-container recording-full-width common-action-container">
                                <select name="action-type" id="select-action-type-select" required>
                                    <option value="${VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_REDIRECT}">Redirect (Open another page directly)</option>
                                    <!-- <option value="${VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK_REDIRECT}">Click and redirect (Open another page by clicking)</option> -->
                                    <option value="${VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK}">Click</option>
                                    <option value="${VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_INPUT}">Input</option>
                                    <!-- <option value="${VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_SELECT}">Select</option> -->
                                    <option value="${VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_SIDE_INSTRUCTION}">Note</option>
                                </select>
                            </div>
                            <div id="w-recording-panel-is-recording-switch-container" class="w-horizontal-item-container recording-full-width w-horizontal-container common-action-container">
                                <p id="is-highlighting-indicator" class="w-horizontal-item-container">Not Highlighting</p>
                                <label id="is-recording-switch-label" class="w-horizontal-item-container">
                                    <input type="checkbox" id="highlight-switch">
                                    <span id="is-recording-switch-slider"></span>
                                </label>
                            </div>
                        </div>
                    </section>
                    <section id="w-recording-panel-more-options-container">
                        <div id="w-recording-panel-more-options-button">
                            ▶ More Options
                        </div>
                        <div id="more-options-content-container">
                            <div id="w-recording-panel-more-options-inputs-container" class="more-options-container">
                                <label id="step-redirect-url-input-container" class="w-material-input-container recording-full-width redirect-action-container car-action-container mdc-text-field mdc-text-field--outlined">
                                    <span class="mdc-notched-outline">
                                        <span class="mdc-notched-outline__leading"></span>
                                        <span class="mdc-notched-outline__notch">
                                            <span class="mdc-floating-label" id="my-label-id">Redirect URL</span>
                                        </span>
                                        <span class="mdc-notched-outline__trailing"></span>
                                    </span>
                                    <input id="step-redirect-url-input" type="text" class="w-material-input mdc-text-field__input" aria-labelledby="my-label-id">
                                </label>
                                <label id="step-option-name-container" class="w-material-input-container recording-full-width click-action-container mdc-text-field mdc-text-field--outlined">
                                    <span class="mdc-notched-outline">
                                        <span class="mdc-notched-outline__leading"></span>
                                        <span class="mdc-notched-outline__notch">
                                            <span class="mdc-floating-label" id="my-label-id">Option Name</span>
                                        </span>
                                        <span class="mdc-notched-outline__trailing"></span>
                                    </span>
                                    <input id="step-option-name" type="text" class="w-material-input mdc-text-field__input" aria-labelledby="my-label-id">
                                </label>
                                <label id="step-option-description-container" class="w-material-input-container recording-full-width click-action-container mdc-text-field mdc-text-field--outlined">
                                    <span class="mdc-notched-outline">
                                        <span class="mdc-notched-outline__leading"></span>
                                        <span class="mdc-notched-outline__notch">
                                            <span class="mdc-floating-label" id="my-label-id">Option Description</span>
                                        </span>
                                        <span class="mdc-notched-outline__trailing"></span>
                                    </span>
                                    <input id="step-option-description" type="text" class="w-material-input mdc-text-field__input" aria-labelledby="my-label-id">
                                </label>
                                <label id="step-option-input-container" class="w-material-input-container recording-full-width input-action-container mdc-text-field mdc-text-field--outlined">
                                    <span class="mdc-notched-outline">
                                        <span class="mdc-notched-outline__leading"></span>
                                        <span class="mdc-notched-outline__notch">
                                            <span class="mdc-floating-label" id="my-label-id">Input Text</span>
                                        </span>
                                        <span class="mdc-notched-outline__trailing"></span>
                                    </span>
                                    <input id="step-option-input" type="text" class="w-material-input mdc-text-field__input" aria-labelledby="my-label-id">
                                </label>
                                <label id="step-custom-url-input-container" class="w-material-input-container recording-full-width common-action-container mdc-text-field mdc-text-field--outlined">
                                    <span class="mdc-notched-outline">
                                        <span class="mdc-notched-outline__leading"></span>
                                        <span class="mdc-notched-outline__notch">
                                            <span class="mdc-floating-label" id="my-label-id">Custom URL</span>
                                        </span>
                                        <span class="mdc-notched-outline__trailing"></span>
                                    </span>
                                    <input id="step-custom-url-input" type="text" class="w-material-input mdc-text-field__input" aria-labelledby="my-label-id">
                                </label>
                            </div>
                            <section id="w-recording-panel-basic-selected-container" class="more-options-container w-horizontal-scroll-container click-action-container input-action-container select-action-container instruction-action-container car-action-container">
                            </section>
                            <section id="w-recording-panel-basic-table-container" class="more-options-container w-horizontal-scroll-container click-action-container">
                            </section>
                            <section id="w-recording-panel-step-options-container" class="more-options-container w-horizontal-scroll-container click-action-container input-action-container select-action-container car-action-container">
                                <div class="w-horizontal-scroll-item-container next-step-button-round-container">
                                    <div id="add-new-step-option-round-button" class="w-round-button">
                                    <div></div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </section>
                    <section id="w-recording-panel-basic-steps-container" class="w-horizontal-scroll-container">
                        <div class="w-horizontal-scroll-item-container next-step-button-round-container">
                            <div id="add-new-step-round-button" class="w-round-button">
                                <div></div>
                            </div>
                        </div>
                    </section>
                    <section id="w-recording-panel-basic-buttons-container">
                        <div class="mdc-button mdc-button--raised" id="discard-recording-button">
                            <span class="mdc-button__label">Discard</span>
                        </div>
                        <div class="mdc-button mdc-button--raised" id="finish-recording-button">
                            <span class="mdc-button__label">Finish</span>
                        </div>
                    </section>
                </div>
                <section class="recording-panel-advanced-section-container">
                    <!-- advanced operations -->
                </section>
                <div class="recording-panel-toogle-advanced-button">
                    <p class="verticle-text">Advanced</p>
                </div>
            </div>
            `
    }
    //UI
    recordingContainer;
    recordingMenuDraggableArea;
    highlightSwitch;
    actionTypeSelector;
    recordUpperContainer;
    mdcTextFields = {}
    tutorialNameInput;
    tutorialDescriptionInput;
    stepNameInput;
    stepDescriptionInput;
    stepCustomURLInput;
    stepRedirectURLInput;
    stepClickOptionName;
    stepClickOptionDescription;
    stepInputOptionText;
    selectedElementContainer;
    selectedTableContainer;
    useAnythingInTableChecker;
    stepOptionsContainer;
    addNewStepOptionButton;
    discardTutorialButton;
    finishTutorialButton;
    stepsContainer;
    addNewStepRoundButton;
    createNewStepButton;
    toogleAdvancedRecordingButton;
    recordingAdvancedSectionContainer;

    //Local Variables
    #isUsingAdvancedRecordingPanel = false
    #isUsingMoreOptions = false
    #hasAdvancedRecordingPanelBeenInitialized = false
    #isCreatingNewTutorial = true

    /**
     * clickOptionName, clickOptionDesc, inputOptionText, clickOptionPath
     */
    #currentStepOptionsCache = []
    #currentStepOptionsIndex = 0

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

        this.recordingContainer = $('#w-recording-panel-container');
        this.recordingMenuDraggableArea = $('#w-recording-menu-draggable-area');
        makeElementDraggable(this.recordingMenuDraggableArea[0], this.recordingContainer[0]);

        this.highlightSwitch = $('#highlight-switch');
        this.isHighlightingIndicator = $('#is-highlighting-indicator');
        UserEventListnerHandler.setRecordingIsHighlighting(false)
        this.highlightSwitch.on('change', () => {
            const checked = this.highlightSwitch.prop('checked');
            UserEventListnerHandler.setRecordingIsHighlighting(checked)
            this.isHighlightingIndicator.html(checked ? 'Highlighting' : 'Not Highlighting')
            UserActionLogger.log(UserActionLogger.ACTION_TYPE.RECORDING.CLICK_HIGHLIGHT, { status: checked })
        })

        this.actionTypeSelector = $('#select-action-type-select');
        this.actionTypeSelector.on('change', () => {
            const selection = parseInt(this.actionTypeSelector.val());
            this.#switchMenu(selection);
            UserActionLogger.log(UserActionLogger.ACTION_TYPE.RECORDING.STEP_TYPE_FOCUS_OUT, { selection })
        })


        this.recordUpperContainer = $('#w-recording-panel-basic-upper-content-container');
        this.tutorialNameInput = $('#tutorial-name-input');
        this.tutorialDescriptionInput = $('#tutorial-description-input');
        this.stepNameInput = $('#step-name-input');
        this.stepDescriptionInput = $('#step-description-input');
        this.stepCustomURLInput = $('#step-custom-url-input');
        this.stepRedirectURLInput = $('#step-redirect-url-input');
        this.stepClickOptionName = $('#step-option-name');
        this.stepClickOptionDescription = $('#step-option-description');
        this.stepInputOptionText = $('#step-option-input');

        this.tutorialNameInput.on("keyup", () => {
            this.#onInputFieldChangedByUser(this.tutorialNameInput, this.tutorialNameInput.val(), UserActionLogger.ACTION_TYPE.RECORDING.EDIT_TUTORIAL_NAME)
        });

        this.tutorialNameInput.on("focusout", () => {
            UserActionLogger.log(UserActionLogger.ACTION_TYPE.RECORDING.TUTORIAL_NAME_FOCUS_OUT, { text: this.tutorialNameInput.val() })
        });

        this.tutorialDescriptionInput.on("keyup", () => {
            this.#onInputFieldChangedByUser(this.tutorialDescriptionInput, this.tutorialDescriptionInput.val(), UserActionLogger.ACTION_TYPE.RECORDING.EDIT_TUTORIAL_DESCRIPTION)
        });

        this.tutorialDescriptionInput.on("focusout", () => {
            UserActionLogger.log(UserActionLogger.ACTION_TYPE.RECORDING.TUTORIAL_DESCRIPTION_FOCUS_OUT, { text: this.tutorialDescriptionInput.val() })
        });

        this.stepNameInput.on("keyup", () => {
            this.#onInputFieldChangedByUser(this.stepNameInput, this.stepNameInput.val(), UserActionLogger.ACTION_TYPE.RECORDING.EDIT_STEP_NAME)
        });

        this.stepNameInput.on("focusout", () => {
            UserActionLogger.log(UserActionLogger.ACTION_TYPE.RECORDING.STEP_NAME_FOCUS_OUT, { text: this.stepNameInput.val(), stepIndex: TutorialsModel.getCurrentStepIndex() })
        });

        this.stepDescriptionInput.on("keyup", () => {
            this.#onInputFieldChangedByUser(this.stepDescriptionInput, this.stepDescriptionInput.val(), UserActionLogger.ACTION_TYPE.RECORDING.EDIT_STEP_DESCRIPTION)
        });

        this.stepDescriptionInput.on("focusout", () => {
            UserActionLogger.log(UserActionLogger.ACTION_TYPE.RECORDING.STEP_DESCRIPTION_FOCUS_OUT, { text: this.stepDescriptionInput.val(), stepIndex: TutorialsModel.getCurrentStepIndex() })
        });


        this.stepCustomURLInput.on("keyup", () => {
            this.stepCustomURLInput.attr("value", this.stepCustomURLInput.val());
        });

        this.stepCustomURLInput.on("focusout", () => {
            UserActionLogger.log(UserActionLogger.ACTION_TYPE.RECORDING.STEP_OPTION_URL_FOCUS_OUT, { text: this.stepCustomURLInput.val(), stepIndex: TutorialsModel.getCurrentStepIndex() })
        });

        this.stepRedirectURLInput.on("keyup", () => {
            this.stepRedirectURLInput.attr("value", this.stepRedirectURLInput.val());
        });

        this.stepRedirectURLInput.on("focusout", () => {
            UserActionLogger.log(UserActionLogger.ACTION_TYPE.RECORDING.STEP_REDIRECT_URL_FOCUS_OUT, { text: this.stepRedirectURLInput.val(), stepIndex: TutorialsModel.getCurrentStepIndex() })
        });

        this.stepClickOptionName.on("keyup", () => {
            this.stepClickOptionName.attr("value", this.stepClickOptionName.val());
        });

        this.stepClickOptionName.on("focusout", () => {
            UserActionLogger.log(UserActionLogger.ACTION_TYPE.RECORDING.STEP_OPTION_NAME_FOCUS_OUT, { text: this.stepClickOptionName.val() })
        });

        this.stepClickOptionDescription.on("keyup", () => {
            this.stepClickOptionDescription.attr("value", this.stepClickOptionDescription.val());
        });

        this.stepClickOptionDescription.on("focusout", () => {
            UserActionLogger.log(UserActionLogger.ACTION_TYPE.RECORDING.STEP_OPTION_DESCRIPTION_FOCUS_OUT, { text: this.stepClickOptionDescription.val() })
        });

        this.stepInputOptionText.on("keyup", () => {
            this.stepInputOptionText.attr("value", this.stepInputOptionText.val());
        });

        this.stepInputOptionText.on("focusout", () => {
            UserActionLogger.log(UserActionLogger.ACTION_TYPE.RECORDING.STEP_OPTION_INPUT_FOCUS_OUT, { text: this.stepInputOptionText.val() })
        });

        document.querySelectorAll('.mdc-text-field').forEach((textField) => {
            const mdcTextField = new mdc.textField.MDCTextField(textField);
            this.mdcTextFields[attributeToCamelCase(textField.id)] = mdcTextField
        });

        this.#setMaterialInputValue(this.stepCustomURLInput, globalCache.currentUrl)

        this.moreOptionsContainer = $('#w-recording-panel-more-options-container')
        this.moreOptionsContentContainer = $('#more-options-content-container')

        this.moreOptionsButton = $('#w-recording-panel-more-options-button');
        this.moreOptionsButton.on('click', () => {
            if (this.#isUsingMoreOptions) {
                this.moreOptionsContentContainer.hide()
                this.#isUsingMoreOptions = false
            } else {
                this.moreOptionsContentContainer.show()
                this.#isUsingMoreOptions = true
            }
            UserActionLogger.log(UserActionLogger.ACTION_TYPE.RECORDING.CLICK_MORE_OPTION, { showMoreOptions: this.#isUsingMoreOptions })
        })
        this.moreOptionsContainer.hide()

        this.moreOptionsInputsContainer = $('#w-recording-panel-more-options-inputs-container');
        this.selectedElementContainer = $('#w-recording-panel-basic-selected-container');
        this.selectedTableContainer = $('#w-recording-panel-basic-table-container');


        this.stepOptionsContainer = $('#w-recording-panel-step-options-container');
        this.addNewStepOptionButton = $('#add-new-step-option-round-button');
        this.addNewStepOptionButton.on('click', () => {
            this.#syncCurrentStepOptionFromUI()
            const newIndex = this.stepOptionsContainer.children().length - 1
            this.#createStepOptionSnapshot({}, newIndex, false)
            this.#currentStepOptionsIndex = newIndex
            this.#currentStepOptionsCache.push({})
            this.#clearOptionRelatedMenuItems()
        })

        this.moreOptionsContentContainer.hide()

        this.stepsContainer = $('#w-recording-panel-basic-steps-container');
        this.addNewStepRoundButton = $('#add-new-step-round-button');
        this.addNewStepRoundButton.on('click', () => {
            this.#onCreateNewStep()
        })
        this.addNewStepRoundButton.hide()

        this.discardTutorialButton = $('#discard-recording-button');
        this.discardTutorialButton.on('click', () => {
            this.#onDiscardTutorialButtonClicked()
        })

        this.finishTutorialButton = $('#finish-recording-button');
        this.finishTutorialButton.on('click', () => {
            this.#onFinishTutorialButtonClicked()
        })

        //advanced
        this.toogleAdvancedRecordingButton = $('.recording-panel-toogle-advanced-button');
        this.toogleAdvancedRecordingButton.on('click', () => {
            this.#onToogleAdvancedRecordingButton()
        })

        this.recordingAdvancedSectionContainer = $('.recording-panel-advanced-section-container').first();

        this.#hideUpperPanel();
    }

    #onInputFieldChangedByUser(inputElement, text, actionTypeForLogger, otherLogs) {
        inputElement.attr("value", text);
        //UserActionLogger.log(actionTypeForLogger, { text, ...otherLogs })
    }

    async #onToogleAdvancedRecordingButton() {
        if (!this.#isUsingAdvancedRecordingPanel) {
            this.recordingContainer.removeClass('w-recording-panel-container-normal');
            this.recordingContainer.addClass('w-recording-panel-advanced-container');
            this.toogleAdvancedRecordingButton.removeClass('recording-panel-toogle-advanced-button');
            this.toogleAdvancedRecordingButton.addClass('recording-panel-toogle-advanced-button-advanced');
            this.#isUsingAdvancedRecordingPanel = true;

            //load model
            !this.#hasAdvancedRecordingPanelBeenInitialized && TutorialsModel.loadTutorialsOnPageWhenRecording(() => {
                this.#createSnapshotsForAllTutorialsInAdvancedPanel()
                this.#hasAdvancedRecordingPanelBeenInitialized = true;
            })
        } else {
            this.recordingContainer.removeClass('w-recording-panel-advanced-container');
            this.recordingContainer.addClass('w-recording-panel-container-normal');
            this.toogleAdvancedRecordingButton.removeClass('recording-panel-toogle-advanced-button-advanced');
            this.toogleAdvancedRecordingButton.addClass('recording-panel-toogle-advanced-button');
            this.#isUsingAdvancedRecordingPanel = false;
        }
    }

    #checkStatus(status) {
        c("checkStatus(), status is " + status)
        switch (status) {
            case VALUES.TUTORIAL_STATUS.IS_CREATING_NEW_TUTORIAL:
                this.#onCreateNewRecording()
                UserEventListnerHandler.setTutorialStatusCache(VALUES.TUTORIAL_STATUS.IS_RECORDING)
                break;
            case VALUES.TUTORIAL_STATUS.IS_RECORDING:
                TutorialsModel.smartInit(() => {
                    this.#createSnapshotForTutorialTitle(TutorialsModel.getCurrentTutorial(), this.stepsContainer)
                    this.#createStepSnapshotsForCurrentTutorial()
                    if (TutorialsModel.getCurrentStepIndex() === -1) {
                        this.#switchToEditTutorialTitleSnapshot()
                    } else {
                        this.#switchToEditStepAtIndex(TutorialsModel.getLastStepIndexForTutorial())
                    }

                })
                UserEventListnerHandler.setTutorialStatusCache(status)
                break;
            case VALUES.TUTORIAL_STATUS.IS_UPDATING:
                TutorialsModel.smartInit(() => {
                    this.#createSnapshotForTutorialTitle(TutorialsModel.getCurrentTutorial(), this.stepsContainer)
                    this.#createStepSnapshotsForCurrentTutorial()
                    this.#switchToEditTutorialTitleSnapshot()

                })
                UserEventListnerHandler.setTutorialStatusCache(status)
    
                break;
            default:
                break;
        }
    }

    #deInitializeUI() {
        this.recordingContainer.remove()
        $('#w-highlight-instruction-window').remove()
    }

    //TutorialsModelFollowingTutorialDelegate

    //UserEventListnerHandlerDelegate
    //logging is done inside user event handler
    onClick() {
        if (UserEventListnerHandler.isLisenting) {
            this.#onClickWhenRecording();
        }
    }

    checkIfShouldPreventDefault(event) {
        const target = event.target
        const dialogContainer = document.getElementById('w-dialog-container')
        return UserEventListnerHandler.recordingIsHighlighting &&
            !aContainsOrIsBNode(target, this.recordingContainer[0]) &&
            !(dialogContainer && aContainsOrIsBNode(target, dialogContainer))
    }

    checkIfShouldProcessEvent(event) {
        return event.target !== globalCache.currentElement &&
            this.checkIfShouldPreventDefault(event)
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

        let nearestTable
        var nearestTablePath
        storeSelectedElementOrNearestTableIfExists()

        //Highlight
        // if (jQElement.is('a')) {
        //     Highlighter.highlight(jQElement.parent());
        // } else {
        //     Highlighter.highlight(jQElement);
        // }
        Highlighter.highlight(jQElement);

        //update recording panel
        this.#updateSelectedElementDomPathView(globalCache.domPath ?? [], nearestTablePath)

        function storeSelectedElementOrNearestTableIfExists() {
            nearestTable = getNearestTableOrList(jQElement[0]);
            if (isNotNull(nearestTable)) {
                nearestTablePath = getShortDomPathStack(nearestTable)
                if ($(jqueryElementStringFromDomPath(nearestTablePath)).length > 1) {
                    nearestTablePath = getCompleteDomPathStack(nearestTable);
                }
            }
        }
    }

    #updateSelectedElementDomPathView(path, nearestTablePath) {
        this.selectedElementContainer.empty();
        path?.forEach((e, i) => {
            this.selectedElementContainer.append(`
            <div class="selected-item-path-container w-horizontal-scroll-item-container">
                <input class="selected-item-path-input" type="text" id="selected-item-path-${i}" value="${e}">
                <div class="selected-item-path-delete" id="selected-item-path-delete-${i}">&times;</div>
            </div>
            <div class="w-horizontal-scroll-item-next-indicator-container w-horizontal-scroll-item-container">
                <div class="w-horizontal-scroll-item-next-indicator">
                </div>
            </div>
            `);
        })

        this.selectedTableContainer.empty();
        this.useAnythingInTableChecker = null
        nearestTablePath?.forEach((e, i) => {
            if (i === 0) {
                this.selectedTableContainer.append(`
                <input type="checkbox" id="use-anything-in-table-chcker" name="use-list" checked></input>
                `)
                this.useAnythingInTableChecker = $('#use-anything-in-table-chcker');
                this.useAnythingInTableChecker.prop('checked', false)
            }
            this.selectedTableContainer.append(`
            <div class="selected-item-path-container w-horizontal-scroll-item-container">
                <input class="selected-item-path-input" type="text" id="selected-item-table-path-${i}" value="${e}">
                <div class="selected-item-path-delete" id="selected-item-table-path-delete-${i}">&times;</div>
            </div>
            <div class="w-horizontal-scroll-item-next-indicator-container w-horizontal-scroll-item-container">
                <div class="w-horizontal-scroll-item-next-indicator">
                </div>
            </div>
            `);
        })
    }

    // UI Control
    #loadMenuForStep(atIndex) {
        const step = TutorialsModel.getStepOfCurrentTutorialAtIndex(atIndex);
        c('loading' + JSON.stringify(step))
        t()
        this.#hideCreateTutorialMenu()
        this.#clearOptionsListAndRelatedMenuItems();
        this.#clearMenu();
        this.#switchMenu(step.actionType, true, !isNotNull(step.actionObject));
        //if actionObject is null, it's a newly created empty step, skip actual loading
        if (isNotNull(step.actionObject)) {
            this.#createStepOptionsCacheFromActionObject(step.actionObject);
            this.#loadMenuInputsForStep(step)
        }
        this.#setMaterialInputValue(this.stepCustomURLInput, isStringEmpty(step.url) ? globalCache.currentUrl : step.url)
    }

    #loadMenuInputsForStep(step) {
        this.#setMaterialInputValue(this.stepNameInput, step.name)
        this.#setMaterialInputValue(this.stepDescriptionInput, step.description)


        const actionObject = step.actionObject
        Step.callFunctionOnActionType(step.actionType, () => {
            this.#updateSelectedElementDomPathView(ClickAction.getPath(actionObject, 0))
            const clicks = actionObject.clicks
            this.#loadStepOptionsToUI(clicks, true)
        }, () => {
            this.#updateSelectedElementDomPathView(ClickAction.getPath(actionObject, 0))
            const clicks = actionObject.clicks
            this.#loadStepOptionsToUI(clicks, true)
        }, () => {
            this.#updateSelectedElementDomPathView(InputAction.getPath(actionObject));
            const inputTexts = actionObject.inputTexts
            this.#loadStepOptionsToUI(inputTexts, true)
        }, () => {

        }, () => {
            this.#updateSelectedElementDomPathView(SelectAction.getPath(actionObject))
        }, () => {
            this.#updateSelectedElementDomPathView(SideInstructionAction.getPath(actionObject))
        }, () => {

        })
    }

    #createStepOptionsCacheFromActionObject(actionObject) {
        if (!isNotNull(actionObject)) return
        actionObject.clicks && actionObject.clicks.forEach((click, index) => {
            this.#currentStepOptionsCache[index] = {
                clickOptionName: click.name,
                clickOptionDescription: click.description,
                clickOptionPath: click.path,
                clickOptionTablePath: click.table,
                clickOptionUseTable: click.useAnythingInTable
            }
        })
        actionObject.inputTexts && actionObject.inputTexts.forEach((text, index) => {
            this.#currentStepOptionsCache[index] = {
                inputOptionText: text
            }
        })
    }

    #loadStepOptionsToUI(options, replaceOriginal) {
        this.#loadStepOptionFromCacheToUI(0)
        this.#createStepOptionsSnapshotWithArray(options, replaceOriginal)
    }

    /**
     * retrieve option at given index from cache and load it to current editing option inputs
     * @param {*} index 
     */
    #loadStepOptionFromCacheToUI(index) {
        const option = this.#currentStepOptionsCache[index]
        this.#setMaterialInputValue(this.stepClickOptionName, option?.clickOptionName ?? '')
        this.#setMaterialInputValue(this.stepClickOptionDescription, option?.clickOptionDescription ?? '')
        this.#setMaterialInputValue(this.stepInputOptionText, option?.inputOptionText ?? '')
        this.#updateSelectedElementDomPathView(option?.clickOptionPath, option?.clickOptionTablePath)
        this.useAnythingInTableChecker?.prop('checked', option.clickOptionUseTable)
    }

    /**
     * Switch the panel UI to match the selected action type.
     * @param {*} selection 
     */
    #switchMenu(selection, clearStepOptions = true, createEmptyStepOptionSnapshot = true) {
        this.actionTypeSelector.val(selection);
        this.#switchMenuUIHelper(clearStepOptions, createEmptyStepOptionSnapshot)
        Step.callFunctionOnActionType(
            selection,
            () => {
                this.#showClickMenu()
                this.#turnHighlightSwitchOn()
            },
            this.#showClickAndRedirectMenu.bind(this),
            () => {
                this.#showInputMenu()
                this.#turnHighlightSwitchOn()
            },
            this.#showRedirectMenu.bind(this),
            this.#showSelectMenu.bind(this),
            () => {
                this.#showSideInstructionMenu()
                this.#turnHighlightSwitchOn()
            }
        );
    }

    #turnHighlightSwitchOn() {
        this.highlightSwitch.prop('checked', true)
        UserEventListnerHandler.setRecordingIsHighlighting(true)
        this.isHighlightingIndicator.html('Highlighting')
    }

    #turnHighlightSwitchOff() {
        this.highlightSwitch.prop('checked', false)
        UserEventListnerHandler.setRecordingIsHighlighting(false)
        this.isHighlightingIndicator.html('Not Hihglighting')
    }

    #switchMenuUIHelper(clearStepOptions, createEmptyStepOptionSnapshot) {
        this.#hideUpperPanel()
        $('.common-action-container').show()
        clearStepOptions && this.#clearOptionsListAndRelatedMenuItems()
        createEmptyStepOptionSnapshot && this.#createStepOptionSnapshot({}, 0, false)
    }

    #showCreateTutorialMenu() {
        $('.tutorial-action-container').show()
        this.actionTypeSelector.parent().hide()
        this.moreOptionsContainer.hide()
    }

    #hideCreateTutorialMenu() {
        $('.tutorial-action-container').hide()
        this.actionTypeSelector.parent().show()
        this.moreOptionsContainer.show()
    }

    #setMaterialInputValue(inputElement, inputText = '') {
        // inputElement.val(inputText)
        // inputElement.attr("value", inputText);
        this.mdcTextFields[attributeToCamelCase(inputElement.attr('id')) + 'Container'].value = inputText
    }

    #clearMenu() {
        this.#setMaterialInputValue(this.stepNameInput)
        this.#setMaterialInputValue(this.stepDescriptionInput)
        this.#setMaterialInputValue(this.stepCustomURLInput)
        this.#setMaterialInputValue(this.stepRedirectURLInput)
        this.#clearOptionsListAndRelatedMenuItems()
        this.selectedElementContainer.empty()
        this.selectedTableContainer.empty()
        this.selectedTableContainer.children().find('.selected-item-path-container, .w-horizontal-scroll-item-next-indicator-container').remove();
    }

    #clearOptionsListAndRelatedMenuItems() {
        this.#currentStepOptionsIndex = 0
        this.#currentStepOptionsCache = []
        this.stepOptionsContainer.children('.step-option-snapshot-container').remove()
        this.#clearOptionRelatedMenuItems()
    }

    #clearOptionRelatedMenuItems() {
        this.#setMaterialInputValue(this.stepClickOptionName)
        this.#setMaterialInputValue(this.stepClickOptionDescription)
        this.#setMaterialInputValue(this.stepInputOptionText)
    }

    #hideUpperPanel() {
        $('#more-options-content-container .redirect-action-container, .input-action-container, .car-action-container, .click-action-container, .select-action-container, .common-action-container, .instruction-action-container').hide();
    }

    #showClickMenu() {
        $('.click-action-container').show();
    }

    #showInputMenu() {
        $('.input-action-container').show();
    }

    #showClickAndRedirectMenu() {
        $('.car-action-container').show();
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
        $('.instruction-action-container').show()
    }

    //Controller controls
    #onCreateNewRecording() {
        const firstStepID = TutorialsModel.onCreateNewRecording()
        this.#createSnapshotForTutorialTitle({ name: 'Tutorial Name' }, this.stepsContainer)
        this.#createEmptyStepSnapshot(0, firstStepID)
        this.#switchToEditTutorialTitleSnapshot()
    }

    #onDiscardTutorialButtonClicked() {
        DialogBox.present(
            'You cannot recover this recording once discarded',
            'Are you sure you want to discard this recording',
            true,
            'Discard',
            this.#onDiscardTutorial.bind(this))
    }

    #onDiscardTutorial() {
        UserEventListnerHandler.setTutorialStatusCache(VALUES.TUTORIAL_STATUS.BEFORE_INIT_NULL)
        UserEventListnerHandler.setRecordingIsHighlighting(false)
        TutorialsModel.discardRecordingTutorial()
        this.dismiss()
    }

    async #onFinishTutorialButtonClicked() {
        if (this.#isCreatingNewTutorial) {
            this.#syncTutorialInfoFromUI(async () => {
                if (RecorderTutorialCompletionChecker.isTutorialComplete()) {
                    await this.#onFinishTutorial()
                }
            })
        } else {
            this.#syncCurrentStepFromUI(async () => {
                if (RecorderTutorialCompletionChecker.isTutorialComplete()) {
                    await this.#onFinishTutorial()
                }
            })
        }
    }

    async #onFinishTutorial() {
        await this.#postTutorialToFirebase()
        this.#onDiscardTutorial()
    }

    #onCreateNewStep() {
        this.#turnHighlightSwitchOff()
        if (this.#isCreatingNewTutorial) {
            this.#syncTutorialInfoFromUI(() => {
                this.#hideCreateTutorialMenu()
                this.#isCreatingNewTutorial = false
                createNewStepHelper.bind(this)()
            })
        } else {
            this.#syncCurrentStepFromUI(createNewStepHelper.bind(this))
        }

        function createNewStepHelper(currentStep) {
            const stepId = TutorialsModel.onCreateNewStep()
            TutorialsModel.saveActiveTutorialToStorage(() => {
                currentStep && clickHighlightedElement(currentStep)
                this.#createEmptyStepSnapshot(TutorialsModel.getLastStepIndexForTutorial(), stepId)
                this.#loadMenuForStep(TutorialsModel.getLastStepIndexForTutorial())
            })

        }

        function clickHighlightedElement(currentStep) {
            if (currentStep.actionType === VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK) {
                const click = ClickAction.getDefaultClick(currentStep.actionObject);
                const element = $(jqueryElementStringFromDomPath(click.path))[0];
                simulateClick(element);
            }
        }
    }

    #syncTutorialInfoFromUI(callback = () => { }) {
        const info = {
            name: this.tutorialNameInput.val(),
            description: this.tutorialDescriptionInput.val()
        }
        TutorialsModel.saveTutorialBasicInfo(info, () => {
            this.#updateTutorialTitleSnapshot()
            callback()
        })
    }

    #syncCurrentStepFromUI(callback) {
        this.#saveCurrentOptionFromUIToCache(this.#currentStepOptionsIndex)
        const currentStep = this.#getStepInfoFromInput(TutorialsModel.getCurrentStepIndex())
        TutorialsModel.saveStep(currentStep, TutorialsModel.getCurrentStepIndex(), true, () => {
            this.#updateStepSnapshot()
            callback && callback(currentStep)
        })
    }

    #getStepPathFromInput() {
        var pathArray = []
        this.selectedElementContainer.find('.selected-item-path-container').each((i, element) => {
            pathArray.push($(element).children('input').val())
        })
        return pathArray
    }

    #getStepTablePathFromInput() {
        var pathArray = []
        this.selectedTableContainer.find('.selected-item-path-container').each((i, element) => {
            pathArray.push($(element).children('input').val())
        })
        return pathArray
    }

    #getStepInfoFromInput(stepIndex) {
        const stepId = TutorialsModel.getCurrentStep().id
        const actionType = parseInt(this.actionTypeSelector.val())
        const selectedElementPath = this.#getStepPathFromInput()
        var actionObject = Step.callFunctionOnActionType(actionType, () => {
            var clicks = []
            this.#currentStepOptionsCache.forEach((option, index) => {
                clicks.push(new ClickGuide(
                    option.clickOptionPath,
                    option.clickOptionName,
                    option.clickOptionDescription,
                    false,
                    null,
                    option.clickOptionUseTable,
                    option.clickOptionTablePath))
            })
            return new ClickAction(clicks);
        }, () => {
            var clicks = []
            this.#currentStepOptionsCache.forEach((option, index) => {
                clicks.push(new ClickGuide(option.clickOptionPath, option.clickOptionName, option.clickOptionDescription, true, null, false, option.clickOptionTablePath))
            })
            return new ClickAction(clicks);
        }, () => {
            var inputTexts = []
            this.#currentStepOptionsCache.forEach((option, index) => {
                inputTexts.push(option.inputOptionText)
            })
            return new InputAction(selectedElementPath, inputTexts, VALUES.INPUT_TYPES.TEXT, null);
        }, () => {
            return new RedirectAction(this.stepRedirectURLInput.val());
        }, () => {
            return new SelectAction(selectedElementPath, [], false);
        }, () => {
            return new SideInstructionAction(selectedElementPath);
        })
        var step = new Step(
            stepId,
            stepIndex,
            actionType,
            actionObject,
            this.stepNameInput.val(),
            this.stepDescriptionInput.val(),
            this.#processInputURLToFinalURLString(),
            false,
            [],
        )
        c('synced from UI: ' + JSON.stringify(step))
        return step
    }

    #processInputURLToFinalURLString() {
        return this.stepCustomURLInput.val() ?? globalCache.currentUrl
    }

    #saveCurrentOptionFromUIToCache(index) {
        const clickOptionName = this.stepClickOptionName.val()
        const clickOptionDescription = this.stepClickOptionDescription.val()
        const inputOptionText = this.stepInputOptionText.val()
        const clickOptionPath = this.#getStepPathFromInput()
        const clickOptionTablePath = this.#getStepTablePathFromInput()
        const clickOptionUseTable = this.useAnythingInTableChecker?.prop('checked') ?? false
        this.#currentStepOptionsCache[index] = { clickOptionName, clickOptionDescription, clickOptionPath, clickOptionTablePath, inputOptionText, clickOptionUseTable }
    }

    /**
     * Get option info from UI (User input), update current option snapshot and save to cache
     */
    #syncCurrentStepOptionFromUI() {
        const index = this.#currentStepOptionsIndex
        //get user input info to cache
        this.#saveCurrentOptionFromUIToCache(index)
        //update current snapshot UI
        const optionSnapshot = this.stepOptionsContainer.children().eq(index)
        if (optionSnapshot.is(this.addNewStepOptionButton.parent())) return
        optionSnapshot.children().eq(0).html(this.#currentStepOptionsCache[index].clickOptionName)
    }

    //UI functions
    #createSnapshotForTutorialTitle(tutorial, parentContainer) {
        const snapshotHTML = SnapshotView.getViewHTML({ ...tutorial, type: SnapshotView.TYPE.TUTORIAL_TITLE })
        parentContainer.prepend(snapshotHTML);
        //events
        const snapshot = parentContainer.children().eq(0)
        snapshot.on('click', this.#onTutorialTitleSnapshotClicked.bind(this))
    }

    #onTutorialTitleSnapshotClicked() {
        this.#syncCurrentStepFromUI(this.#switchToEditTutorialTitleSnapshot.bind(this))
    }

    #switchToEditTutorialTitleSnapshot() {
        this.#hideUpperPanel()
        this.#showCreateTutorialMenu()
        TutorialsModel.changeCurrentTutorialStepIndexTo(-1)
        this.#isCreatingNewTutorial = true
        this.addNewStepRoundButton.hide()

        const info = TutorialsModel.getCurrentTutorial()

        this.#setMaterialInputValue(this.tutorialNameInput, info.name)
        this.#setMaterialInputValue(this.tutorialDescriptionInput, info.description)
    }



    #createStepSnapshot(atIndex, snapshot, type) {
        const steps = TutorialsModel.getCurrentTutorial().steps;
        const prevStep = steps[atIndex - 1] ?? null;
        const nextStep = steps[atIndex + 1] ?? null;
        const prevStepSnapshot = prevStep ? $(`#${prevStep.id}`) : null;
        const nextStepSnapshot = nextStep ? $(`#${nextStep.id}`) : null;
        const id = snapshot.id
        if (prevStepSnapshot?.length > 0 && prevStep?.url === snapshot.url) {
            //append to existing page
            const pageContainer = prevStepSnapshot.parent().parent()
            pageContainer.children().eq(1).append(SnapshotView.getViewHTML({ ...snapshot, type }))
            this.#updatePageContainersOnCreateNewStep(pageContainer)
        } else if (nextStepSnapshot?.length > 0 && nextStep?.url === snapshot.url) {
            //prepend to existing page
            const pageContainer = nextStepSnapshot.parent().parent()
            pageContainer.children().eq(1).prepend(SnapshotView.getViewHTML({ ...snapshot, type }))
            this.#updatePageContainersOnCreateNewStep(pageContainer)
        } else {
            //new page container
            snapshot.type = SnapshotView.TYPE.RECORDING_STEP_AND_URL_CONTAINER
            const snapshotHTML = SnapshotView.getViewHTML(snapshot)
            if (prevStepSnapshot?.length > 0) {
                //insert after previous page container
                prevStepSnapshot.parent().parent().after(snapshotHTML);
            } else if (nextStepSnapshot?.length > 0) {
                //insert before previous page container
                nextStepSnapshot.parent().parent().before(snapshotHTML);
            } else {
                //no existing step, add before button
                if (type === SnapshotView.TYPE.RECORDING_STEP) {
                    this.addNewStepRoundButton.parent().before(snapshotHTML)
                } else if (type === SnapshotView.TYPE.STEP_FROM_OTHER) {
                    $(`#advanced-tutorials-container-${snapshot.tutorialId}`).append(snapshotHTML)
                } else {
                    return;
                }
            }
        }

        this.#addStepSnapshotListeners(id)
    }

    #addStepSnapshotListeners(id) {
        const element = document.getElementById(id)
        element.addEventListener("mouseenter", () => {
            const step = TutorialsModel.getCurrentTutorial().steps[SnapshotView.getSnapshotIndex(id)]
            step.actionType && Highlighter.highlight(Step.getPath(step))
        })
        element.addEventListener("mouseleave", () => {
            Highlighter.removeLastHighlight()
        })
        element.addEventListener('click', () => {
            this.#onStepSnapshotClicked(id)
        })
    }

    #updatePageContainersOnCreateNewStep(pageContainer) {
        pageContainer.children().first().css({ width: pageContainer.width() })
    }

    #onStepSnapshotClicked(id) {
        const index = SnapshotView.getSnapshotIndex(id)
        if (index === TutorialsModel.getCurrentStepIndex()) return
        this.#turnHighlightSwitchOff()
        if (this.#isCreatingNewTutorial) {
            this.#syncTutorialInfoFromUI(() => { this.#switchToEditStepAtIndex(index) })
        } else {
            this.#syncCurrentStepFromUI(() => { this.#switchToEditStepAtIndex(index) })
        }
    }

    #switchToEditStepAtIndex(index) {
        //TODO: when updating tutorial, will jump to the url correspond to that step
        TutorialsModel.changeCurrentTutorialStepIndexTo(index)
        c('switchToEditStepAtIndex' + index)
        this.#isCreatingNewTutorial = false
        this.addNewStepRoundButton.show()
        this.#loadMenuForStep(index)
    }

    #createEmptyStepSnapshot(atIndex, id) {
        this.#createStepSnapshot(atIndex, { id, url: globalCache.currentUrl }, SnapshotView.TYPE.RECORDING_STEP)
    }




    #createStepOptionsSnapshotWithArray(contents, replaceOriginal) {
        contents.forEach((content, index) => {
            this.#createStepOptionSnapshot(content, index, replaceOriginal)
        })
    }

    #createStepOptionSnapshot(content, index, replaceOriginal) {
        const type = SnapshotView.TYPE.RECORING_STEP_OPTION
        const snapshotHTML = SnapshotView.getViewHTML({ ...content, type })
        var originalStepOptionAtIndex = this.stepOptionsContainer.children().eq(index)
        if (originalStepOptionAtIndex.is(this.addNewStepOptionButton.parent()) || originalStepOptionAtIndex.length === 0) {
            originalStepOptionAtIndex = null
        }
        if (replaceOriginal && isNotNull(originalStepOptionAtIndex)) {
            originalStepOptionAtIndex.replaceWith(snapshotHTML)
        } else {
            jQueryinsertAt(this.stepOptionsContainer, index, snapshotHTML)
        }

        //events
        const snapshot = this.stepOptionsContainer.children().eq(index)
        snapshot.on("mouseenter", () => {
            const index = getElementIndexInParent(snapshot[0])
            const option = this.#currentStepOptionsCache[index]
            Highlighter.highlight(option?.clickOptionPath)
        })
        snapshot.on("mouseleave", () => {
            Highlighter.removeLastHighlight()
        })

        snapshot.on('click', () => {
            this.#onStepOptionSnapshotClicked(snapshot)
        })
    }

    #onStepOptionSnapshotClicked(snapshot) {
        this.#syncCurrentStepOptionFromUI()
        const index = getElementIndexInParent(snapshot[0])
        this.#currentStepOptionsIndex = index
        this.#loadStepOptionFromCacheToUI(index)
    }




    /**
     * Use current tutorial in tutorial model and create step snapshots
     */
    #createStepSnapshotsForCurrentTutorial() {
        TutorialsModel.getCurrentTutorial().steps.forEach((step, index) => {
            this.#createStepSnapshot(index, step, SnapshotView.TYPE.RECORDING_STEP)
        })
    }

    #updateStepSnapshot() {
        const step = TutorialsModel.getCurrentStep()
        const stepSnapshotView = $(`#${step.id}`)
        stepSnapshotView.find('.step-snapshot-name-label').html(`${step.name.length ? step.name : 'Step Name'}`)
        stepSnapshotView.find('.step-snapshot-description-label').html(`${step.description}`)
        //here
    }

    #updateTutorialTitleSnapshot() {
        const name = TutorialsModel.getCurrentTutorial().name
        this.stepsContainer.children().eq(0).children().eq(0).children().eq(0).html(`${isStringEmpty(name) ? 'Tutorial Name' : name}`)
    }

    //Adcanced actions
    #createSnapshotsForAllTutorialsInAdvancedPanel() {
        TutorialsModel.forEachTutorial((tutorial, index) => {
            if (index === 0) return
            this.#createSnapshotsForTutorialInAdvancedPanel(tutorial)
        })
    }

    #createSnapshotsForTutorialInAdvancedPanel(tutorial) {
        tutorial.steps.forEach((step, index) => {
            step.tutorialId = tutorial.id
            if (step.url === globalCache.currentUrl) {
                if (index !== 0) {
                    this.#createStepSnapshot(index, step, SnapshotView.TYPE.STEP_FROM_OTHER)
                } else {
                    this.#createSnapshotsContainerAndTutorialTitle(tutorial, this.recordingAdvancedSectionContainer)
                    this.#createStepSnapshot(index, step, SnapshotView.TYPE.STEP_FROM_OTHER)
                }
            }
        })
        // document.querySelectorAll('.step-snapshot-container').forEach(element => {
        //     //drag and drop handler
        //     element.usePlaceholder = true
        //     DragAndDropHandler.addDragListenerToElement(element)
        //     //DragAndDropHandler.dropHandlerDelegate = window
        //     //mouse over handler
        // });
    }

    #createSnapshotsContainerAndTutorialTitle(tutorial, parentContainer) {
        const snapshotHTML = SnapshotView.getViewHTML({ ...tutorial, type: SnapshotView.TYPE.TUTORIAL_TITLE })
        parentContainer.prepend(`
        <div id="advanced-tutorials-container-${tutorial.id}" class="w-horizontal-scroll-container w-recording-panel-advanced-steps-container">
            ${snapshotHTML}
        </div>
        `);
    }

    //------------------------------------------------------------------------------------------------------------
    //MARK: Utility functions------------------------------------------------------
    //------------------------------------------------------------------------------------------------------------
    #checkfTutorialIsComplete() {
        // var isTutorialCompleted = true
        // if (isStringEmpty(TutorialsModel.getCurrentTutorial().name)) {

        // }
        // TutorialsModel.getCurrentTutorial().steps.forEach((step, index) => {
        //     if (!Step.isStepCompleted(step)) {
        //         isTutorialCompleted = false
        //     }
        // })
        // return isTutorialCompleted
        return true
    }


    //------------------------------------------------------------------------------------------------------------
    //MARK: Firebase actions------------------------------------------------------
    //------------------------------------------------------------------------------------------------------------
    async #deleteDocIfExists() {
        hugeStorageGetMultiple(VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID, async (result) => {
            const docId = result[VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID];
            if (isNotNull(docId)) {
                const tutorialRef = doc(ExtensionController.FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL, docId);
                await deleteDoc(tutorialRef);
            }
        })
    }

    async #postTutorialToFirebase() {
        const tutorial = TutorialsModel.getCurrentTutorial()
        var updateId = "Id NOT FOUND"
        const tutorialQuery = await getDocs(collection(ExtensionController.SHARED_FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL));
        tutorialQuery.forEach((docUrl) => {
            if (docUrl.data().name == tutorial.name) {
                updateId = docUrl.id;
            }
        })

        if (updateId != "Id NOT FOUND") {
            await updateDoc(doc(ExtensionController.SHARED_FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL, updateId), {
                name: tutorial.name,
                description: tutorial.description
            });

            for (var i = 0; i < tutorial.steps.length; i++) {
                await setDoc(doc(ExtensionController.SHARED_FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL, updateId, "Steps", tutorial.steps[i].id), JSON.parse(JSON.stringify(tutorial.steps[i])))
            }
            return;
        }

        const docRef = await addDoc(collection(ExtensionController.SHARED_FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL), {
            name: tutorial.name,
            description: tutorial.description
        })
        const docId = docRef.id;
        var allUrls = new Set()

        const batch = writeBatch(ExtensionController.SHARED_FIRESTORE_REF);
        //TODO: upload tutorial. json steps using this foreach method
        tutorial.steps.forEach((step, index) => {
            batch.set(doc(
                ExtensionController.SHARED_FIRESTORE_REF,
                VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL,
                docId,
                "Steps",
                step.id
            ), JSON.parse(JSON.stringify(step)))
            allUrls.add(step.url)
        })
        await batch.commit();
        await updateDoc(docRef, {
            all_urls: Array.from(allUrls),
        })

        //Iterator:
        const values = allUrls.values();
        var obj = values.next();

        while (!obj.done) {
            let urlString = obj.value; //Get the url string of the tutorial.
            const strArray = urlString.split("/");
            urlString = strArray[2]; //Get the "absolute" address

            let flag = true; //Exist in VALUES.FIRESTORE_CONSTANTS.URL or not?

            const urlQuery = await getDocs(collection(ExtensionController.SHARED_FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.URL));
            //Find matched doc => put this tutorial into it
            urlQuery.forEach((docUrl) => {
                if (docUrl.id == urlString && flag == true) {
                    const tutorialRef = doc(ExtensionController.SHARED_FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.URL, docUrl.id, VALUES.FIRESTORE_CONSTANTS.URL_ALLURL, docId);
                    setDoc(tutorialRef, {
                        regexUrl: numRegexUrl(allUrls)
                    }) //Add tut into an existing url document.
                    flag = false;
                }
            })

            if (flag) {
                //Did not find existed doc => create a new doc, put this tutorial into it
                await setDoc(doc(ExtensionController.SHARED_FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.URL, urlString), {
                    notes: ""
                });
                await setDoc(doc(ExtensionController.SHARED_FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.URL, urlString, VALUES.FIRESTORE_CONSTANTS.URL_ALLURL, docId), {
                    regexUrl: numRegexUrl(allUrls)
                })
            }

            obj = values.next();
        }
    }

    async isUpdating(name) {
        const tutorialQuery = await getDocs(collection(ExtensionController.SHARED_FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL));
        tutorialQuery.forEach((docUrl) => {
            if (docUrl.data().name == name) {
                return true;
            }
        })
        return false
    }

    // If updating, what is the id of the tutorial
    async findUpdateTutorialId(name) {
        const tutorialQuery = await getDocs(collection(ExtensionController.SHARED_FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL));
        tutorialQuery.forEach((docUrl) => {
            if (docUrl.data().name == name) {
                return docUrl.id;
            }
        })
        return "Id NOT FOUND"
    }

    dismiss() {
        this.#deInitializeUI()

        TutorialsModel.tutorialsModelFollowingTutorialDelegate = null
        UserEventListnerHandler.userEventListnerHandlerDelegate = null
        Highlighter.highlighterViewControllerSpecificUIDelegate = null
    }
}
