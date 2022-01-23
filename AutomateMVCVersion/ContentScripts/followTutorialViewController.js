class FollowTutorialViewController {
    //Constants
    static #WORKFLOW_LIST_POPUP_HTML_SIMPLE() {
        return `
        <div class="w-workflow-list-popup">
            <div id="w-main-draggable-area" class="w-popup-draggable"></div>
            <div class="w-workflow-list-popup-header">
                <div class="w-search-bar-container">
                    <input class="w-search-bar" type="text" title="Search">
                    <img class="w-search-icon" src="./assets/imgs/icons/search.svg" title="Search">
                </div>
            </div>
            <div class="w-close-button" id="w-workflow-list-popup-close-button"></div>
            <div class="w-workflow-list-popup-scroll-area"></div>

            <div class="w-workflow-list-popup-footer">
                <div id="w-stop-options-stop-button" class="w-workflow-list-cell-type-button w-workflow-list-popup-footer-cell">
                    <title class="w-workflow-list-cell-type-button-name">Stop</title>
                    <div class="w-more-info-icon-container">
                        <img class="w-more-info-icon" src="./assets/imgs/icons/question-mark.svg"
                            title="">
                    </div>
                </div>
                <div id="w-popup-next-step-button" class="w-workflow-list-cell-type-button">
                    <title class="w-workflow-list-cell-type-button-name">Next</title>
                    <div class="w-more-info-icon-container">
                        <img class="w-more-info-icon" src="./assets/imgs/icons/question-mark.svg"
                            title="">
                    </div>
                </div>
            </div>
        </div>`
    }

    static #HIGHLIGHT_INSTRUCTIONI_WINDOW_HTML() {
        return `
            <div id="w-highlight-instruction-window" class="w-highlight-instruction-window">
                <h3 id="w-popup-step-name" class="w-following-tutorial-item"></h3>
                <p id="w-popup-step-description" class="w-following-tutorial-item"></p>
            </div>
        `
    }

    //UI
    mainPopUpContainer;
    mainDraggableArea;
    mainCloseButton;
    mainPopupScrollArea;

    searchIconURL = chrome.runtime.getURL('assets/imgs/icons/search.svg');
    questionMarkURL = chrome.runtime.getURL('assets/imgs/icons/question-mark.svg');


    highlightInstructionWindow;
    popUpStepName;
    popUpStepDescription;
    mainPopupFooter
    popUpNextStepButton;
    stopOptionsStopButton;

    wrongPageRedirectButton;

    //Local Variables
    #sideInstructionAutoNextTimer = null;
    #isMainPopUpCollapsed = false;

    //Delegates
    followTutorialViewControllerDelegate;

    constructor(status) {
        TutorialsModel.tutorialsModelFollowingTutorialDelegate = this
        UserEventListnerHandler.userEventListnerHandlerDelegate = this
        Highlighter.highlighterViewControllerSpecificUIDelegate = this
        this.#initializeUI()
        this.#checkStatus(status)
    }

    #initializeUI() {
        $('body').append(this.#getAllContentHTML());

        this.mainPopUpContainer = $('.w-workflow-list-popup');
        this.mainDraggableArea = $('#w-main-draggable-area');
        makeElementDraggable(this.mainDraggableArea[0], this.mainPopUpContainer[0]);

        document.getElementsByClassName('w-search-icon')[0].src = this.searchIconURL
        $('.w-more-info-icon').attr('src', this.questionMarkURL)

        this.mainCloseButton = $('#w-workflow-list-popup-close-button');
        this.mainCloseButton.on("click", () => {
            if (this.#isMainPopUpCollapsed) {
                this.mainPopUpContainer.removeClass('w-workflow-list-popup-collapsed');
                this.mainPopUpContainer.addClass('w-workflow-list-popup');
                this.mainCloseButton.removeClass('w-close-button-collapsed');
                this.mainCloseButton.addClass('w-close-button');
                this.mainPopUpContainer.find('.w-should-reopen').show();
                this.mainPopUpContainer.find('.w-should-reopen').removeClass('w-should-reopen');

                this.#isMainPopUpCollapsed = false;
            } else {
                this.mainPopUpContainer.find(':visible').each((i, element) => {
                    $(element).addClass('w-should-reopen');
                })
                this.mainPopUpContainer.removeClass('w-workflow-list-popup');
                this.mainPopUpContainer.addClass('w-workflow-list-popup-collapsed');
                this.mainPopUpContainer.children().hide();
                this.mainCloseButton.removeClass('w-close-button');
                this.mainCloseButton.addClass('w-close-button-collapsed');
                this.mainCloseButton.show()
                this.mainDraggableArea.show();
                this.#isMainPopUpCollapsed = true;
            }
        })

        this.mainPopupScrollArea = $('.w-workflow-list-popup-scroll-area')

        //guides during tutorial
        this.mainPopupFooter = $('.w-workflow-list-popup-footer')
        this.popUpNextStepButton = $("#w-popup-next-step-button");
        this.popUpNextStepButton.on('click', event => {
            //auto go to next step
            this.#onPopUpNextStepButtonClicked()
        })

        this.stopOptionsStopButton = $('#w-stop-options-stop-button');
        this.stopOptionsStopButton.on('click', () => {
            this.stopCurrentTutorial()
        });
        this.mainPopupFooter.hide()

        // this.wrongPageRedirectButton = $('#w-wrong-page-redirect-button');

        //Highlight instruction window
        this.highlightInstructionWindow = $('#w-highlight-instruction-window');
        this.highlightInstructionWindow.hide();
        this.popUpStepName = $("#w-popup-step-name");
        this.popUpStepName.css({ 'overflow-wrap': 'break-word', });
        this.popUpStepDescription = $("#w-popup-step-description");
        this.popUpStepDescription.css({ 'overflow-wrap': 'break-word', });
    }

    #getAllContentHTML() {
        return FollowTutorialViewController.#WORKFLOW_LIST_POPUP_HTML_SIMPLE() + FollowTutorialViewController.#HIGHLIGHT_INSTRUCTIONI_WINDOW_HTML()
    }

    #checkStatus(status) {
        UserEventListnerHandler.setTutorialStatusCache(status)
        switch (status) {
            case VALUES.TUTORIAL_STATUS.STOPPED_FROM_OTHER_PAGE:
                this.stopCurrentTutorial()
                break
            case VALUES.TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL:
                TutorialsModel.smartInit(this.#showCurrentStep.bind(this))
                break;
            case VALUES.TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL:
                TutorialsModel.smartInit(this.#showCurrentStep.bind(this))
                break;
            case VALUES.TUTORIAL_STATUS.LOADED:

                break;
            case VALUES.TUTORIAL_STATUS.BEFORE_INIT_NULL:
                TutorialsModel.smartInit(() => {
                    TutorialsModel.forEachTutorial((tutorial, index) => {
                        this.#addTutorialButton(tutorial, index)
                    })
                })
                break;
            default:
                break;
        }
    }

    //TutorialsModelFollowingTutorialDelegate


    //UserEventListnerHandlerDelegate
    onClick() {
        if (UserEventListnerHandler.tutorialStatusCache === VALUES.TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL || eventHandler.isAutomationInterrupt) {
            this.onClickWhenFollowingTutorial();
        }
    }

    checkIfShouldPreventDefault(event) {
        return false
    }

    checkIfShouldProcessEvent(event) {
        return (event.target !== globalCache.currentElement &&

            !$.contains(this.mainPopUpContainer[0], event.target))
    }

    //HighlighterViewControllerSpecificUIDelegate
    useInstructionWindow = true
    //highlightInstructionWindow has been declared in UI section
    updateStepInstructionUIHelper() {
        if (isEmpty(TutorialsModel.getCurrentStep().name)) {
            TutorialsModel.getCurrentStep().name = `Step ${TutorialsModel.getCurrentStep().index}`;
        }
        if (isEmpty(TutorialsModel.getCurrentStep().description)) {
            TutorialsModel.getCurrentStep().description = `Select the highlighted box`;
        }
        this.popUpStepName.html(TutorialsModel.getCurrentStep().name);
        this.popUpStepDescription.html(TutorialsModel.getCurrentStep().description);
    }

    highlightedElementNotFoundHandler() {
        const firstStepOnPageIndex = TutorialsModel.getFirstStepIndexOnCurrentPage();
        if (firstStepOnPageIndex > -1) {
            this.#switchToAndShowStepAtIndex(firstStepOnPageIndex);
            if (TutorialsModel.getCurrentStep().possibleReasonsForElementNotFound.length > 0) {
                //show in highlight instruction window why might the cause of error be
            }
        }
    }

    //Controls
    #onFollowTutorialModeChosen(type, tutorialID) {
        //UI
        this.#switchToManualFollowingTutorialView()

        UserEventListnerHandler.setTutorialStatusCache(type);
        this.#startFollowingNewTutorial(tutorialID);
    }

    #switchToAndShowStepAtIndex(stepIndex) {
        if (stepIndex >= TutorialsModel.getCurrentTutorial().steps.length) {
            this.stopCurrentTutorial();
            return;
        }
        TutorialsModel.changeCurrentTutorialStepIndexTo(stepIndex, () => {
            const type = UserEventListnerHandler.tutorialStatusCache;
            if (type === VALUES.TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL) {
                this.#showTutorialStepManual();
            }
            if (type === VALUES.TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL) {
                this.#showTutorialStepAuto();
            }
        })
    }

    #startFollowingNewTutorial(tutorialID) {
        TutorialsModel.changeActiveTutorialToChosen(tutorialID)
        this.#switchToAndShowStepAtIndex(0)
    }

    /**
     * Show step as indicated by tutorial.currentStepIndex. Usually used after
     * refreshing page or going to new page to load the current step.
     * If is on wrong page url, show alarm
     */
    #showCurrentStep() {
        const currentStep = TutorialsModel.getCurrentStep();
        if (TutorialsModel.checkIfCurrentURLMatchesPageURL()) {
            this.#switchToManualFollowingTutorialView()
            this.#switchToAndShowStepAtIndex(TutorialsModel.getCurrentTutorial().currentStepIndex);
        } else {
            this.#onEnteredWrongPage(currentStep);
        }
    }

    #showNextStep() {
        this.#switchToAndShowStepAtIndex(TutorialsModel.getCurrentTutorial().currentStepIndex + 1);
    }

    stopCurrentTutorial() {
        //UI
        Highlighter.removeLastHighlight()
        clearTimeout(this.#sideInstructionAutoNextTimer);
        this.#sideInstructionAutoNextTimer = null;
        this.highlightInstructionWindow.hide()

        const data = {};
        data[VALUES.STORAGE.REVISIT_PAGE_COUNT] = 0;
        if (!isNotNull(TutorialsModel.getCurrentTutorial())) {
            data[VALUES.TUTORIAL_STATUS.STATUS] = VALUES.TUTORIAL_STATUS.BEFORE_INIT_NULL;
            syncStorageSetBatch(data, () => {
                this.setOrUpdateChooseTutorialsPopupUIFromModel()
                globalCache = new GlobalCache();
            });
        }
        if (TutorialsModel.checkIfCurrentURLMatchesPageURL()) {
            //stop from within page
            data[VALUES.TUTORIAL_STATUS.STATUS] = VALUES.TUTORIAL_STATUS.BEFORE_INIT_NULL;
            syncStorageSetBatch(data, () => {
                TutorialsModel.revertCurrentTutorialToInitialState();
                UserEventListnerHandler.setTutorialStatusCache(VALUES.TUTORIAL_STATUS.BEFORE_INIT_NULL)
                this.#switchToMainWorkflowListView()
                globalCache = new GlobalCache();
            });
        } else {
            data[VALUES.TUTORIAL_STATUS.STATUS] = VALUES.TUTORIAL_STATUS.STOPPED_FROM_OTHER_PAGE;
            syncStorageSetBatch(data);
            this.mainPopUpContainer.hide();
        }
    }

    setOrUpdateChooseTutorialsPopupUIFromModel() {
        this.mainPopUpContainer.show()
        this.mainPopupFooter.hide()
        TutorialsModel.forEachTutorial((tutorial, index) => {
            this.#addTutorialButton(tutorial, index)
        })
    }

    //INCOMPLETE
    #onEnteredWrongPage(tutorialObj, urlToMatch) {
        for (let i = 0; i < tutorialObj.steps.length; i++) {
            const currentStep = tutorialObj.steps[i];
            if (currentStep.url === urlToMatch) {
                //show the matched step
                tutorialObj.currentStep = i;
                const RPCKey = VALUES.STORAGE.REVISIT_PAGE_COUNT;
                chrome.storage.sync.get([RPCKey], result => {
                    if (result[RPCKey] > VALUES.STORAGE.MAX_REVISIT_PAGE_COUNT) {
                        alert('no matching page');
                        this.stopCurrentTutorial();
                        return false;
                    }
                    syncStorageSet(RPCKey, result[RPCKey] + 1, () => {
                        // syncStorageSet(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, tutorialObj, () => {
                        //     showTutorialStepAuto();

                        //     return true;
                        // });
                    })
                })
            }
        }
    }

    #chooseFunctionAccordingToCurrentStepType(onStepActionClick, onStepActionClickRedirect, onStepActionRedirect, onStepActionInput, onStepActionSelect, onStepSideInstruction) {
        const currentStep = TutorialsModel.getCurrentStep();
        //onEnteredWrongPage(tutorialObj, currentStep.url);
        Step.callFunctionOnActionType(currentStep.actionType, onStepActionClick, onStepActionClickRedirect, onStepActionInput, onStepActionRedirect, onStepActionSelect, onStepSideInstruction)
    }

    #showTutorialStepManual() {
        this.#chooseFunctionAccordingToCurrentStepType(
            this.#manualStep.bind(this),
            this.#manualStep.bind(this),
            this.#manualRedirect.bind(this),
            this.#manualInput.bind(this),
            this.#manualSelect.bind(this),
            this.#manualSideInstruction.bind(this)
        );
    }

    //------------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------------
    //MARK: Walk me through screen actions
    //------------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------------
    #manualStep() {
        const click = TutorialsModel.getCurrentStep().actionObject.defaultClick;
        //const element = $(jqueryElementStringFromDomPath(click.path)).first();
        if (click.useAnythingInTable) {
            Highlighter.highlight(click.table, true, Highlighter.HIGHLIGHT_TYPES.SCROLL_AND_ALERT);
        } else {
            Highlighter.highlight(click.path, true, Highlighter.HIGHLIGHT_TYPES.SCROLL_AND_ALERT);
        }
    }

    #onPopUpNextStepButtonClicked() {
        const currentStep = TutorialsModel.getCurrentStep();
        if (currentStep.actionType === VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK || "STEP_ACTION_TYPE_CLICK") {
            const step = currentStep.actionObject.defaultClick;
            const element = $(jqueryElementStringFromDomPath(step.path))[0];
            simulateClick(element);
        }

    }

    #manualRedirect() {
        const click = TutorialsModel.getCurrentStep().actionObject.defaultClick;
        if (click.useAnythingInTable) {
            Highlighter.highlight(click.table, true, Highlighter.HIGHLIGHT_TYPES.SCROLL_AND_ALERT);
        } else {
            Highlighter.highlight(click.path, true, Highlighter.HIGHLIGHT_TYPES.SCROLL_AND_ALERT);
        }
    }

    #manualInput() {
        const inputObj = TutorialsModel.getCurrentStep().actionObject;
        //const element = $(jqueryElementStringFromDomPath(inputObj.path)).first();
        Highlighter.highlight(inputObj.path, true, Highlighter.HIGHLIGHT_TYPES.SCROLL_AND_ALERT);
    }

    #manualSelect() {
        const click = TutorialsModel.getCurrentStep().actionObject.defaultClick;
    }

    #manualSideInstruction() {
        const sideInstructionObj = TutorialsModel.getCurrentStep().actionObject;
        Highlighter.highlight(sideInstructionObj.path, true, Highlighter.HIGHLIGHT_TYPES.SCROLL_AND_ALERT);
        //UI
        this.#sideInstructionAutoNextTimer = setTimeout(() => {
            this.#incrementCurrentStepHelper();
        }, 3000);
    }

    #updateStepInstructionUIHelper() {
        if (isEmpty(TutorialsModel.getCurrentStep().name)) {
            TutorialsModel.getCurrentStep().name = `Step ${TutorialsModel.getCurrentStep().index}`;
        }
        if (isEmpty(TutorialsModel.getCurrentStep().description)) {
            TutorialsModel.getCurrentStep().description = `Select the highlighted box`;
        }
        popUpStepName.html(TutorialsModel.getCurrentStep().name);
        popUpStepDescription.html(TutorialsModel.getCurrentStep().description);
    }

    //------------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------------
    //MARK: Automating tutorial functions
    //------------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------------
    #showTutorialStepAuto() {
        this.#chooseFunctionAccordingToCurrentStepType(this.#autoClick, this.#autoClick, this.#autoRedirect, this.#autoInput, this.#autoSelect, this.#autoSideInstruction)
    }

    #autoClick() {
        const step = TutorialsModel.getCurrentStep().actionObject.defaultClick;
        if (step.useAnythingInTable || TutorialsModel.getCurrentStep().automationInterrupt) {
            //stop automation
            UserEventListnerHandler.setIsAutomationInterrupt(true);
            manualStep();
            return;
        }
        const element = $(jqueryElementStringFromDomPath(step.path))[0];
        Highlighter.highlight(step.path, true, Highlighter.HIGHLIGHT_TYPES.ALERT, () => {
            simulateClick(element);
            this.#incrementCurrentStepHelper();
        });
    }


    #autoRedirect() {
        const url = TutorialsModel.getCurrentStep().actionObject.url;
        TutorialsModel.getCurrentTutorial().currentStep += 1;
        location.replace(url);
    }

    #autoInput() {
        const step = TutorialsModel.getCurrentStep().actionObject;
        //get and highlight input element
        const inputEle = $(jqueryElementStringFromDomPath(step.path)).first();

        Highlighter.highlight(step.path, true, Highlighter.HIGHLIGHT_TYPES.ALERT, () => {
            //check if there is default input
            const defaultText = step.defaultText;
            // if (isNotNull(defaultText) && !isEmpty(defaultText)) {
            //     //fill input with default
            //     inputEle.val(defaultText);
            //     this.#incrementCurrentStepHelper(tutorialObj);
            // } else {
            //     //asks for input

            // }        
            UserEventListnerHandler.setIsAutomationInterrupt(true);
            return;
        });
    }

    #autoSelect() {
        const step = TutorialsModel.getCurrentStep().actionObject;
        //get and highlight input element
        const selectEle = $(jqueryElementStringFromDomPath(step.path)).first();
        Highlighter.highlight(step.path, true, Highlighter.HIGHLIGHT_TYPES.ALERT, () => {
            //check if there is default input
            selectEle.val(step.defaultValue);
            //this step completed, go to next step
            this.#incrementCurrentStepHelper();
        });
    }

    #autoSideInstruction() {
        this.#incrementCurrentStepHelper();
    }

    #incrementCurrentStepHelper() {
        UserEventListnerHandler.setIsAutomationInterrupt(false);
        this.#showNextStep()
    }

    //------------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------------
    //MARK: Handling click when walking through tutorial
    //------------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------------
    onClickWhenFollowingTutorial() {
        //TODO: add regexp and handle user mistakes
        console.log('onClickWhenFollowingTutorial');
        this.#chooseFunctionAccordingToCurrentStepType(
            onClickWithStepTypeClick.bind(this),
            onClickWithStepTypeClick.bind(this),
            onClickWithStepTypeRedirect.bind(this),
            onClickWithStepTypeInput.bind(this),
            null,
            onClickWithStepTypeSideInstruction.bind(this))

        function onClickWithStepTypeClick() {
            const click = TutorialsModel.getCurrentStep().actionObject.defaultClick;
            if (click.useAnythingInTable) {
                const tablePath = click.table;

                if (isSelectedOnRightElement(globalCache.domPath, tablePath)) {
                    this.#incrementCurrentStepHelper();
                } else {
                    onClickedOnWrongElement(tablePath);
                }
            } else {
                const clickPath = click.path;
                console.log('should click' + clickPath);
                if (isSelectedOnRightElement(globalCache.domPath, clickPath)) {
                    this.#incrementCurrentStepHelper();
                    return;
                } else {
                    onClickedOnWrongElement(clickPath);
                }
            }
        }

        function onClickWithStepTypeInput() {
            const inputPath = TutorialsModel.getCurrentStep().actionObject.path;
            if (isSelectedOnRightElement(globalCache.domPath, inputPath)) {
                //TODO: record input and go to next step only when inputted one char
                this.#incrementCurrentStepHelper();
                return;
            } else {
                onClickedOnWrongElement(inputPath);
            }
        }

        function onClickWithStepTypeRedirect() {

        }

        function onClickWithStepTypeSideInstruction() {
            const elementPath = TutorialsModel.getCurrentStep().actionObject.path;
            if (isSelectedOnRightElement(globalCache.domPath, elementPath)) {
                clearTimeout(this.#sideInstructionAutoNextTimer);
                this.#sideInstructionAutoNextTimer = null;
                this.#incrementCurrentStepHelper();
                return;
            } else {
                onClickedOnWrongElement(elementPath);
            }
        }

        function onClickedOnWrongElement(path) {
            //simulateClick(globalCache.currentElement);
            console.log('wrong element')
            setTimeout(() => {
                Highlighter.highlight(path, true, Highlighter.HIGHLIGHT_TYPES.SCROLL_AND_ALERT);
            }, 100);
        }
    }


    #deInitializeUI() {
        $('.w-workflow-list-popup').remove()
        $('#w-highlight-instruction-window').remove()
    }

    //lifecycle
    dismiss() {
        this.stopCurrentTutorial()
        this.#deInitializeUI()

        TutorialsModel.tutorialsModelFollowingTutorialDelegate = null
        UserEventListnerHandler.userEventListnerHandlerDelegate = null
        Highlighter.highlighterViewControllerSpecificUIDelegate = null
    }

    //Pure UI methods
    #addTutorialButton(tutorial, index) {
        const tutorialID = tutorial.id
        this.mainPopupScrollArea.append(`
                <div class="w-workflow-list-cell" id=\"${tutorialID}\">
                    <div class="w-workflow-list-cell-upper-container">
                        <div class="w-workflow-list-cell-attribute-icon"></div>
                        <div class="w-workflow-list-cell-name">${tutorial.name}</div>
                    </div>
                </div>
            `);

        const item = document.getElementById(`${tutorialID}`)
        const original = item.innerHTML
        const cellMouseEnterBinded = cellMouseEnter.bind(this)
        const cellMouseLeaveBinded = cellMouseLeave.bind(this)
        item.addEventListener('mouseenter', cellMouseEnterBinded)
        item.addEventListener('mouseleave', cellMouseLeaveBinded)

        function cellMouseEnter(event) {
            if (item.innerHTML === original) {
                $(item).append(`
                <div class="w-workflow-list-cell-select-type-container">
                    <div class="w-workflow-list-cell-type-button w-workflow-list-cell-type-button-auto" >
                        <title class="w-workflow-list-cell-type-button-name">Auto</title>
                        <div class="w-more-info-icon-container">
                            <img class="w-more-info-icon"
                                src="${this.questionMarkURL}"
                                title="Automatically go to the desired place">
                        </div>
                    </div>
                    <div class="w-workflow-list-cell-type-button w-workflow-list-cell-type-button-manual">
                        <title class="w-workflow-list-cell-type-button-name">Show Me</title>
                        <div class="w-more-info-icon-container">
                            <img class="w-more-info-icon"
                                src="${this.questionMarkURL}"
                                title="Walk me through the process">
                        </div>
                    </div>
                </div>
                `)
                item.getElementsByClassName('w-workflow-list-cell-type-button-auto')[0].addEventListener('click', e => {
                    this.#onFollowTutorialModeChosen(VALUES.TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL, tutorialID)
                })
                item.getElementsByClassName('w-workflow-list-cell-type-button-manual')[0].addEventListener('click', e => {
                    this.#onFollowTutorialModeChosen(VALUES.TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL, tutorialID)
                })
            } else {
                $(item).children().show()
            }
            Highlighter.highlight(Step.getPath(TutorialsModel.getFirstStepOfTutorialAtIndex(index)))
        }

        function cellMouseLeave(event) {
            $(event.target).children().last().hide()
            if (!$(event.target).is(':visible')) return
            this.highlightInstructionWindow.hide()
            Highlighter.removeLastHighlight()
        }
    }

    #switchToMainWorkflowListView() {
        if (this.mainPopupScrollArea.children().length > 0) {
            this.mainPopupFooter.hide()
            this.mainPopupScrollArea.children().show()
        } else {
            this.setOrUpdateChooseTutorialsPopupUIFromModel()
        }
        this.highlightInstructionWindow.hide()
    }

    #switchToManualFollowingTutorialView() {
        this.mainPopupScrollArea.children().hide()
        this.mainPopupFooter.show()

        this.popUpStepName.html('');
        this.popUpStepDescription.html('');
    }
}