class FollowTutorialViewController {
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

    constructor(status, followTutorialViewControllerDelegate) {
        this.followTutorialViewControllerDelegate = followTutorialViewControllerDelegate
        ExtensionController.SHARED_TUTORIALS_MODEL.tutorialsModelFollowingTutorialDelegate = this
        this.#initializeUI()

        this.#checkStatus(status)
    }

    #initializeUI() {
        const body = $('body');
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
        this.mainPopUpContainer = $('#w-main-popup-container');

        this.mainDraggableArea = $('#w-main-draggable-area');
        makeElementDraggable(this.mainDraggableArea[0], this.mainPopUpContainer[0]);

        this.automationSpeedSlider = $('#w-automation-speed-slider');
        this.automationSpeedSlider.on('change', () => {
            //onAutomationSpeedSliderChanged();
        })

        this.popUpHeader = $('#w-popup-header');
        this.mainCloseButton = $('#w-main-close-button');

        this.mainCloseButton.on("click", () => {
            if (globalCache.isMainPopUpCollapsed) {
                this.mainPopUpContainer.removeClass('w-popup-collapsed');
                this.mainPopUpContainer.addClass('w-main-popup');
                this.mainCloseButton.removeClass('w-close-button-collapsed');
                this.mainCloseButton.addClass('w-close-button');
                this.mainPopUpContainer.find('.w-should-reopen').show();
                this.mainPopUpContainer.find('.w-should-reopen').removeClass('w-should-reopen');

                globalCache.isMainPopUpCollapsed = false;
            } else {
                this.mainPopUpContainer.find(':visible').each((i, element) => {
                    $(element).addClass('w-should-reopen');
                })
                this.mainPopUpContainer.removeClass('w-main-popup');
                this.mainPopUpContainer.addClass('w-popup-collapsed');
                this.mainPopUpContainer.children().hide();
                this.mainCloseButton.removeClass('w-close-button');
                this.mainCloseButton.addClass('w-close-button-collapsed');
                this.popUpHeader.show();
                this.mainDraggableArea.show();
                globalCache.isMainPopUpCollapsed = true;
            }
        })


        //choose options before start
        this.popUpAutomateButton = $("#w-popup-automate-button");
        this.popUpManualButton = $("#w-popup-manual-button");
        this.popUpCancelButton = $('#w-popup-cancel-button');
        this.popUpCancelButton.on('click', () => {
            $('.w-follow-tutorial-options-item').hide();
            //fetchTutorialsFromStorage();
        })

        //guides during tutorial
        this.popUpNextStepButton = $("#w-popup-next-step-button");
        this.popUpNextStepButton.hide();
        this.popUpNextStepButton.on('click', event => {
            //auto go to next step
            //onPopUpNextStepButtonClicked();
        })

        this.stopOptionsStopButton = $('#w-stop-options-stop-button');
        this.stopOptionsStopButton.on('click', () => {
            //onStopTutorialButtonClicked();
        });

        this.wrongPageRedirectButton = $('#w-wrong-page-redirect-button');

        this.mainPopUpContainer.children().hide();
        $('.w-common-item').show();

        //Highlight instruction window
        this.highlightInstructionWindow = $('#w-highlight-instruction-window');
        this.highlightInstructionWindow.hide();
        this.popUpStepName = $("#w-popup-step-name");
        this.popUpStepName.css({ 'overflow-wrap': 'break-word', });
        this.popUpStepDescription = $("#w-popup-step-description");
        this.popUpStepDescription.css({ 'overflow-wrap': 'break-word', });
    }

    #checkStatus(status) {
        switch (status) {
            case VALUES.TUTORIAL_STATUS.STOPPED_FROM_OTHER_PAGE:
                this.stopCurrentTutorial()
                break
            case VALUES.TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL:

                break;
            case VALUES.TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL:

                break;
            case VALUES.TUTORIAL_STATUS.LOADED:

                break;
            case VALUES.TUTORIAL_STATUS.BEFORE_INIT_NULL:
                ExtensionController.SHARED_TUTORIALS_MODEL.initializeFromFirestore()
                break;
            default:
                break;
        }
    }

    //TutorialsModelFollowingTutorialDelegate methods
    makeButtonFromTutorialData(tutorialData, tutorialID) {
        this.mainPopUpContainer.append(`
        <a class=\"w-simple-tutorial-button w-not-following-tutorial-item w-button-normal\" id=\"${tutorialID}\">
            ${tutorialData.name}
        </a> 
        `);
        const button = $(`#${tutorialID}`).first();

        //button click function. store tutorial's steps to storage
        button.on('click', () => {
            this.#onFollowTutorialButtonClicked(tutorialID);
        });
    }

    //Controls
    #onFollowTutorialButtonClicked(tutorialID) {
        globalCache.reHighlightAttempt = 0;
        //UI
        $('.w-follow-tutorial-options-item').show();
        $('.w-not-following-tutorial-item').remove();
        this.popUpNextStepButton.hide();
        this.#automationSpeedSliderHelper();

        this.popUpAutomateButton.on('click', () => {
            this.#onFollowTutorialTypeButtonClicked(VALUES.TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL, tutorialID);
        });

        this.popUpManualButton.on('click', () => {
            this.#onFollowTutorialTypeButtonClicked(VALUES.TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL, tutorialID);
        });
    }


    #onFollowTutorialTypeButtonClicked(type, tutorialID) {
        //UI
        $('.w-follow-tutorial-options-item').hide();
        $('.w-following-tutorial-item').show();
        this.popUpStepName.html('');
        this.popUpStepDescription.html('');

        ExtensionController.SHARED_USER_EVENT_LISTNER_HANDLER.setTutorialStatusCache(type);
        ExtensionController.SHARED_TUTORIALS_MODEL.onFollowingNewTutorial(tutorialID);
    }

    async stopCurrentTutorial() {
        //UI
        //removeLastHighlight();
        $('.w-following-tutorial-item, .w-follow-tutorial-options-item, .w-highlight-instruction-window').hide();

        const tutorialsManager = ExtensionController.SHARED_TUTORIALS_MODEL
        const data = {};
        data[VALUES.STORAGE.REVISIT_PAGE_COUNT] = 0;
        if (!isNotNull(tutorialsManager.tutorials[0])) {
            data[VALUES.TUTORIAL_STATUS.STATUS] = VALUES.TUTORIAL_STATUS.BEFORE_INIT_NULL;
            syncStorageSetBatch(data, () => {
                //fetchTutorialsFromStorage();
                globalCache = new GlobalCache();
            });
        }
        if (tutorialsManager.checkIfCurrentURLMatchesPageURL()) {
            data[VALUES.TUTORIAL_STATUS.STATUS] = VALUES.TUTORIAL_STATUS.LOADED;
            syncStorageSetBatch(data, () => {
                tutorialsManager.revertCurrentTutorialToInitialState();
                //fetchTutorialsFromStorage();
                globalCache = new GlobalCache();
            });
        } else {
            data[VALUES.TUTORIAL_STATUS.STATUS] = VALUES.TUTORIAL_STATUS.STOPPED_FROM_OTHER_PAGE;
            syncStorageSetBatch(data);
            this.mainPopUpContainer.hide();
        }
    }

    dismiss() {
        this.stopCurrentTutorial()
    }

    //Pure UI methods
    #automationSpeedSliderHelper() {
        this.automationSpeedSlider.val(globalCache.speedBarValue);
    }


}