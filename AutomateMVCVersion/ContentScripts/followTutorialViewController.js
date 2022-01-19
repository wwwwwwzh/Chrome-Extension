class FollowTutorialViewController {
    //Constants
    static #WORKFLOW_LIST_POPUP_HTML_SIMPLE() {
        return `
        <div id="w-workflow-list-popup-simple" class="w-workflow-list-popup">
            <div id="w-main-draggable-area" class="w-common-item w-popup-draggable"></div>
            <div id="w-workflow-list-popup-header">
                <div class="w-search-bar-container">
                    <input class="w-search-bar" type="text" title="Search">
                    <img class="w-search-icon" src="./assets/imgs/icons/search.svg" title="Search">
                </div>
                <img class="w-close-icon w-workflow-list-popup-close-button" src="./assets/imgs/icons/close.svg" title="Close">
            </div>
            <div id="w-workflow-list-popup-scroll-area"></div>
        </div>`
    }

    static #WORKFLOW_LIST_POPUP_HTML_AUTUMN() {
        return `
            <div id="w-workflow-list-popup-autumn" class="w-workflow-list-popup">
                <div id="w-main-draggable-area"  class="w-common-item w-popup-draggable"></div>

                <div id="w-popup-header" class="w-common-item w-header">
                    <div class="w-common-item w-close-button w-workflow-list-popup-close-button" id="w-workflow-list-popup-close-button-autumn"></div>
                </div>

                <button id="w-popup-automate-button" class="w-follow-tutorial-options-item w-button-normal">Automate</button>
                <button id="w-popup-manual-button" class="w-follow-tutorial-options-item w-button-normal">Walk Me Through</button>
                <button id="w-popup-cancel-button" class="w-follow-tutorial-options-item w-button-normal">Cancel</button>

                <button id="w-popup-next-step-button" class="w-following-tutorial-item w-button-normal">Next</button>
                <button id="w-stop-options-stop-button" class="w-following-tutorial-item w-button-normal">Stop</button>
                
                <input type="range" min="1" max="100" value="50" id="w-automation-speed-slider" class="w-common-item">

                <a href="/" id="w-wrong-page-redirect-button" class="w-wrong-page-item w-wrong-page-redirect-button">You have an ongoing tutorial on [website address]</a>
            </div>
        `
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
    automationSpeedSlider;
    stopOptionsStopButton;
    popUpAutomateButton;
    popUpManualButton;
    popUpCancelButton;
    popUpStepName;
    popUpStepDescription;
    popUpNextStepButton;
    wrongPageRedirectButton;
    mainCloseButton;
    popUpHeader;
    highlightInstructionWindow;

    //Local Variables
    #sideInstructionAutoNextTimer = null
    #isMainPopUpCollapsed = false
    #speedBarValue = 50

    //Delegates
    followTutorialViewControllerDelegate

    constructor(status) {
        TutorialsModel.tutorialsModelFollowingTutorialDelegate = this
        UserEventListnerHandler.userEventListnerHandlerDelegate = this
        Highlighter.highlighterViewControllerSpecificUIDelegate = this
        this.#initializeUI()
        this.#checkStatus(status)
    }

    #initializeUI() {
        $('body').append(this.#getAllContentHTML());
        this.#initializeUICommon()
        this.#initializeUISimple()












        this.mainPopUpContainer.children().hide();
        $('.w-common-item').show();


    }

    #getAllContentHTML() {
        return FollowTutorialViewController.#WORKFLOW_LIST_POPUP_HTML_SIMPLE() + FollowTutorialViewController.#HIGHLIGHT_INSTRUCTIONI_WINDOW_HTML()
    }

    #initializeUICommon() {
        this.mainPopUpContainer = $('.w-workflow-list-popup');

        this.mainDraggableArea = $('#w-main-draggable-area');
        makeElementDraggable(this.mainDraggableArea[0], this.mainPopUpContainer[0]);

        // this.popUpHeader = $('#w-popup-header');
        // this.mainCloseButton = $('.w-workflow-list-popup-close-button');

        // this.mainCloseButton.on("click", () => {
        //     if (this.#isMainPopUpCollapsed) {
        //         this.mainPopUpContainer.removeClass('w-popup-collapsed');
        //         this.mainPopUpContainer.addClass('w-workflow-list-popup');
        //         this.mainCloseButton.removeClass('w-close-button-collapsed');
        //         this.mainCloseButton.addClass('w-close-button');
        //         this.mainPopUpContainer.find('.w-should-reopen').show();
        //         this.mainPopUpContainer.find('.w-should-reopen').removeClass('w-should-reopen');

        //         this.#isMainPopUpCollapsed = false;
        //     } else {
        //         this.mainPopUpContainer.find(':visible').each((i, element) => {
        //             $(element).addClass('w-should-reopen');
        //         })
        //         this.mainPopUpContainer.removeClass('w-workflow-list-popup');
        //         this.mainPopUpContainer.addClass('w-popup-collapsed');
        //         this.mainPopUpContainer.children().hide();
        //         this.mainCloseButton.removeClass('w-close-button');
        //         this.mainCloseButton.addClass('w-close-button-collapsed');
        //         this.popUpHeader.show();
        //         this.mainDraggableArea.show();
        //         this.#isMainPopUpCollapsed = true;
        //     }
        // })

        // //guides during tutorial
        // this.popUpNextStepButton = $("#w-popup-next-step-button");
        // this.popUpNextStepButton.hide();
        // this.popUpNextStepButton.on('click', event => {
        //     //auto go to next step
        //     this.#onPopUpNextStepButtonClicked()
        // })

        // this.stopOptionsStopButton = $('#w-stop-options-stop-button');
        // this.stopOptionsStopButton.on('click', () => {
        //     this.stopCurrentTutorial()
        // });

        // this.wrongPageRedirectButton = $('#w-wrong-page-redirect-button');

        //Highlight instruction window
        this.highlightInstructionWindow = $('#w-highlight-instruction-window');
        this.highlightInstructionWindow.hide();
        this.popUpStepName = $("#w-popup-step-name");
        this.popUpStepName.css({ 'overflow-wrap': 'break-word', });
        this.popUpStepDescription = $("#w-popup-step-description");
        this.popUpStepDescription.css({ 'overflow-wrap': 'break-word', });
    }

    #initializeUIAutumn() {
        this.automationSpeedSlider = $('#w-automation-speed-slider');
        this.automationSpeedSlider.on('change', () => {
            this.#onAutomationSpeedSliderChanged();
        })

        //choose options before start
        this.popUpAutomateButton = $("#w-popup-automate-button");
        this.popUpManualButton = $("#w-popup-manual-button");
        this.popUpCancelButton = $('#w-popup-cancel-button');
        this.popUpCancelButton.on('click', () => {
            $('.w-follow-tutorial-options-item').hide();
            this.setOrUpdateChooseTutorialsPopupUIFromModel()
        })
    }

    #initializeUISimple() {

    }


    #checkStatus(status) {
        UserEventListnerHandler.setTutorialStatusCache(status)
        switch (status) {
            case VALUES.TUTORIAL_STATUS.STOPPED_FROM_OTHER_PAGE:
                this.stopCurrentTutorial()
                break
            case VALUES.TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL:
                TutorialsModel.loadActiveTutorialFromStorage(this.#showCurrentStep.bind(this))
                break;
            case VALUES.TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL:
                TutorialsModel.loadActiveTutorialFromStorage(this.#showCurrentStep.bind(this))
                break;
            case VALUES.TUTORIAL_STATUS.LOADED:

                break;
            case VALUES.TUTORIAL_STATUS.BEFORE_INIT_NULL:
                TutorialsModel.smartInit(() => {
                    TutorialsModel.forEachTutorial((tutorial) => {
                        this.#addTutorialButton(tutorial)
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
            event.target !== this.stopOptionsStopButton[0])
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
    #onTutorialChosen(tutorialID) {
        globalCache.reHighlightAttempt = 0;
        //UI
        $('.w-follow-tutorial-options-item').show();
        $('.w-not-following-tutorial-item').remove();
        this.popUpNextStepButton.hide();
        this.#automationSpeedSliderHelper();

        this.popUpAutomateButton.on('click', () => {
            this.#onFollowTutorialModeChosen(VALUES.TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL, tutorialID);
        });

        this.popUpManualButton.on('click', () => {
            this.#onFollowTutorialModeChosen(VALUES.TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL, tutorialID);
        });
    }


    #onFollowTutorialModeChosen(type, tutorialID) {
        //UI
        $('.w-follow-tutorial-options-item').hide();
        $('.w-following-tutorial-item').show();
        this.popUpStepName.html('');
        this.popUpStepDescription.html('');

        this.#startFollowingNewTutorial(tutorialID);
        UserEventListnerHandler.setTutorialStatusCache(type);
    }

    #switchToAndShowStepAtIndex(stepIndex) {
        if (stepIndex >= TutorialsModel.getCurrentTutorial().steps.length) {
            this.stopCurrentTutorial();
            return;
        }
        TutorialsModel.changeCurrentTutorialStepIndexTo(stepIndex)
        const type = UserEventListnerHandler.tutorialStatusCache;
        if (type === VALUES.TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL) {
            this.#showTutorialStepManual();
        }
        if (type === VALUES.TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL) {
            this.#showTutorialStepAuto();
        }
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
        c(this)
        if (TutorialsModel.checkIfCurrentURLMatchesPageURL()) {
            $('.w-following-tutorial-item').show();
            this.#switchToAndShowStepAtIndex(TutorialsModel.getCurrentTutorial().currentStepIndex);
        } else {
            this.#onEnteredWrongPage(currentStep);
        }
    }

    #showNextStep() {
        this.#switchToAndShowStepAtIndex(++TutorialsModel.getCurrentTutorial().currentStepIndex);
    }

    stopCurrentTutorial() {
        //UI
        Highlighter.removeLastHighlight()
        clearTimeout(this.#sideInstructionAutoNextTimer);
        this.#sideInstructionAutoNextTimer = null;
        $('.w-following-tutorial-item, .w-follow-tutorial-options-item, .w-highlight-instruction-window').hide();

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
            data[VALUES.TUTORIAL_STATUS.STATUS] = VALUES.TUTORIAL_STATUS.BEFORE_INIT_NULL;
            syncStorageSetBatch(data, () => {
                TutorialsModel.revertCurrentTutorialToInitialState();
                UserEventListnerHandler.setTutorialStatusCache(VALUES.TUTORIAL_STATUS.BEFORE_INIT_NULL)
                this.setOrUpdateChooseTutorialsPopupUIFromModel()
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
        $('.w-not-following-tutorial-item').remove();
        this.#automationSpeedSliderHelper();
        TutorialsModel.forEachTutorial((tutorial, index) => {
            this.#addTutorialButton(tutorial)
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
        const interval = intervalFromSpeed(this.#speedBarValue);
        globalCache.interval = interval;
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
        console.log(click.path)
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
        chooseFunctionAccordingToCurrentStepType(this.#autoClick, this.#autoClick, this.#autoRedirect, this.#autoInput, this.#autoSelect, this.#autoSideInstruction)
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

    #onAutomationSpeedSliderChanged() {
        this.#speedBarValue = automationSpeedSlider.val();
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
    #automationSpeedSliderHelper() {
        this.automationSpeedSlider.val(this.#speedBarValue);
    }


    #addTutorialButton(tutorial) {
        addTutorialButtonSimple(this)


        function addTutorialButtonAutumn(selfReference) {
            selfReference.mainPopUpContainer.append(`
            <a class=\"w-simple-tutorial-button w-not-following-tutorial-item w-button-normal\" id=\"${tutorial.id}\">
                ${tutorial.name}
            </a> 
            `);
            const button = document.getElementById(`${tutorial.id}`)

            //button click function. store tutorial's steps to storage
            button.addEventListener('click', () => {
                selfReference.#onTutorialChosen(tutorial.id);
            });
        }

        function addTutorialButtonSimple(selfReference) {
            selfReference.mainPopUpContainer.append(`
                <div class="w-workflow-list-cell" id=\"${tutorial.id}\">
                    <div class="w-workflow-list-cell-upper-container">
                        <div class="w-workflow-list-cell-attribute-icon"></div>
                        <div class="w-workflow-list-cell-name">${tutorial.name}</div>
                    </div>
                </div>
            `);

            const item = document.getElementById(`${tutorial.id}`)
            const original = item.innerHTML
            item.addEventListener('click', () => {
                $(item).append(`
                <div class="w-workflow-list-cell-select-type-container">
                    <div class="w-workflow-list-cell-type-button">
                        <title class="w-workflow-list-cell-type-button-name">Auto</title>
                        <div class="w-more-info-icon-container">
                            <img class="w-more-info-icon"
                                src="./assets/imgs/icons/question-mark.svg"
                                title="Automatically go to the desired place">
                        </div>
                    </div>
                    <div class="w-workflow-list-cell-type-button">
                        <title class="w-workflow-list-cell-type-button-name">Show me</title>
                        <div class="w-more-info-icon-container">
                            <img class="w-more-info-icon"
                                src="./assets/imgs/icons/question-mark.svg"
                                title="Walk me through the process">
                        </div>
                    </div>
                </div>
            `)
            })

            item.addEventListener('mouseleave', e => {
                e.target.innerHTML = original
            })
        }
    }
}