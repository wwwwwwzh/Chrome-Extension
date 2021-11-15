class UIManager {
    constructor() {

    }

    //general
    onFetchingTutorialsFromCloud() {
        $('.w-not-following-tutorial-item').remove();
        automationSpeedSliderHelper();
    }



    //recording

    //following
    onOnWrongPage(currentStep) {
        globalCache.globalEventsHandler.setIsOnRightPage(false);
        mainPopUpContainer.children().hide();
        mainDraggableArea.show();
        popUpHeader.show();
        $('.w-wrong-page-item').show();
        stopOptionsStopButton.show();
        wrongPageRedirectButton.html(`<p>You have an ongoing tutorial at</p> ${currentStep.url}`);
        wrongPageRedirectButton.attr('href', currentStep.url);
    }

    loadSingleTutorialButton(tutorialData, tutorialID) {
        mainPopUpContainer.append(`
        <a class=\"w-simple-tutorial-button w-not-following-tutorial-item w-button-normal\" id=\"${tutorialID}\">
            ${tutorialData.name}
        </a> 
        `);
        const button = $(`#${tutorialID}`).first();

        //button click function. store tutorial's steps to storage
        button.on('click', () => {
            onFollowTutorialButtonClicked(tutorialID);
        });
    }

    loadTutorialButtonsFromCache() {
        tutorialsManager.tutorials.forEach((tutorial) => {
            const tutorialID = tutorial.id;
            const tutorialData = tutorial;
            this.loadSingleTutorialButton(tutorialData, tutorialID);
        })
    }

    onTutorialChosenToFollow() {
        $('.w-follow-tutorial-options-item').show();
        $('.w-not-following-tutorial-item').remove();
        popUpNextStepButton.hide();
        automationSpeedSliderHelper();
    }

    showFollowingTutorialItems() {
        $('.w-follow-tutorial-options-item').hide();
        $('.w-following-tutorial-item').show();

        popUpStepName.html('');
        popUpStepDescription.html('');
    }

    onTutorialStopped() {
        removeLastHighlight();
        $('.w-following-tutorial-item, .w-follow-tutorial-options-item, .w-highlight-instruction-window').hide();

    }
}



/**
 * Singleton extension manager for all tutorial related tasks. Can be initiated from
 * firestore or storage. The active tutorial being editted or followed is always at 
 * the front
 */
class TutorialsManager {
    /**
     * Should be called ONLY ONCE when creating the global variable.
     * @param {[TutorialObject]} tutorials 
     */
    constructor() {
        this.tutorials = [];
    }

    getCurrentTutorial() {
        return this.tutorials[0];
    }

    getCurrentStep() {
        const currentTutorial = this.tutorials[0];
        return currentTutorial.steps[currentTutorial.currentStepIndex];
    }

    async initiateFtomFirestore(tutorialsQuerySnapshot, callback = () => { }) {
        this.tutorials = [];
        await Promise.all(tutorialsQuerySnapshot.docs.map(async (tutorial) => {
            const tutorialID = tutorial.id;
            const tutorialData = tutorial.data();

            uiManager.loadSingleTutorialButton(tutorialData, tutorialID);

            //get all information about the tutorial from firebase
            const stepsQuery = query(collection(firestoreRef,
                VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL,
                tutorialID,
                VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL_STEPS
            ), orderBy(VALUES.FIRESTORE_CONSTANTS.STEP_INDEX));
            const stepsQuerySnapshot = await getDocs(stepsQuery);
            //construct steps array from query
            var steps = [];
            //TODO!: solve url problem (possibly using regex)
            var isFirstStepReached = false;
            stepsQuerySnapshot.forEach((step) => {
                const data = step.data();
                data.id = step.id;
                //remove steps used prior to accessing this page
                if (isFirstStepReached) {
                    steps.push(data);
                } else {

                    if (checkIfUrlMatch(data.url, globalCache.currentUrl)) {
                        isFirstStepReached = true;
                        steps.push(data);
                    }
                }
            })

            this.tutorials.push(new TutorialObject(tutorialData.name, '', [], steps, tutorialData.all_urls, tutorialID));
        }));
        this.saveToStorage(callback);

    }

    loadFromStorage(callback = () => { }) {
        chrome.storage.sync.get([VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL, VALUES.STORAGE.ALL_OTHER_TUTORIALS], (result) => {
            const currentTutorial = result[VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL];
            const allOtherTutorials = result[VALUES.STORAGE.ALL_OTHER_TUTORIALS];
            this.tutorials = [currentTutorial, ...allOtherTutorials];
            console.log('loading ' + this.tutorials.length + ' tutorials from storage')
            callback();
        });
    }

    loadCurrentTutorialFromStorage(callback = () => { }) {
        chrome.storage.sync.get([VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL], (result) => {
            const currentTutorial = result[VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL];
            if (this.tutorials.length > 0) {
                this.tutorials[0] = currentTutorial;
            } else {
                this.tutorials = [currentTutorial];
            }
            callback();
        });
    }

    saveToStorage(callback = () => { }) {
        console.log('saving ' + this.tutorials.length + ' tutorials to storage')
        syncStorageSetBatch({
            [VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL]: this.tutorials[0],
            [VALUES.STORAGE.ALL_OTHER_TUTORIALS]: this.tutorials.slice(1),
        }, callback);
    }

    saveCurrentTutorialToStorage(callback = () => { }) {
        console.log('saving current tutorials to storage')
        syncStorageSet([VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL], this.tutorials[0], callback);
    }

    getFirstStepIndexOnCurrentPage() {
        var firstStepIndexOnCurrentPage = -1;
        this.tutorials[0].steps.some((step, index) => {
            if (checkIfUrlMatch(step.url, globalCache.currentUrl)) {
                firstStepIndexOnCurrentPage = index;
                return true;
            }
        });
        return firstStepIndexOnCurrentPage;
    }

    //recording methods
    saveCurrentTutorialWhenRecording() {
        //copy elements from ui
        //save current step to sync
        this.saveCurrentTutorialToStorage();
    }

    updateUIWhenRecording() {
        //elements to ui
    }

    onCurrentStepChangedWhenRecording(newStepIndex) {
        // this.saveCurrentTutorialWhenRecording();
        // this.tutorials[0].currentStepIndex = newStepIndex;
        // this.updateUIWhenRecording();
    }

    uploadToFirestoreOnFinishRecording() {

    }

    //following tutorial functions
    onFollowingStep(stepIndex) {
        this.tutorials[0].currentStepIndex = stepIndex;
        const type = globalCache.globalEventsHandler.tutorialStatusCache;
        if (type === VALUES.TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL) {
            showTutorialStepManual();
        }
        if (type === VALUES.TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL) {
            showTutorialStepAuto();
        }
    }

    onFollowingNewTutorial(tutorialID) {
        //move selected tutorial to index 0
        if (this.tutorials.length > 1) {
            var tutorialToFollowIndex;
            this.tutorials.forEach((tutorial, index) => {
                if (tutorial.id === tutorialID) {
                    tutorialToFollowIndex = index;
                }
            });
            const temp = this.tutorials[0];
            this.tutorials[0] = this.tutorials[tutorialToFollowIndex];
            this.tutorials[tutorialToFollowIndex] = temp;
            this.saveToStorage(() => {
                this.onFollowingStep(0)
            });
        }
    }

    showCurrentStep() {
        const currentStep = tutorialsManager.getCurrentStep();

        if (checkIfUrlMatch(currentStep.url, globalCache.currentUrl)) {
            $('.w-following-tutorial-item').show();
            this.onFollowingStep(this.getCurrentTutorial().currentStepIndex);

        } else {
            uiManager.onOnWrongPage(currentStep);
        }
    }

    onFollowingNextStep() {
        this.onFollowingStep(++this.getCurrentTutorial().currentStepIndex);
        this.saveCurrentTutorialToStorage();
    }

    revertCurrentTutorialToInitialState() {
        this.tutorials[0].currentStepIndex = 0;
        this.saveCurrentTutorialToStorage();
    }

}

class TutorialObject {
    constructor(name = '', description = '', snapshot = [], steps = [], urls = [], id = null) {
        this.name = name;
        this.description = description;
        this.snapshot = snapshot;
        this.steps = steps;
        this.urls = urls;
        this.currentStepIndex = 0;
        this.id = id;
    }
}

class Step {
    /**
     * 
     * @param {number} index 
     * @param {string} actionType 
     * @param {RedirectAction | ClickAction | InputAction | SelectAction | SideInstructionAction | NullAction} actionObject 
     * @param {[string]} possibleReasonsForElementNotFound
     */
    constructor(index, actionType, actionObject, name, description, url, automationInterrupt = false, possibleReasonsForElementNotFound = [], id = null) {
        this.index = index;
        this.actionType = actionType;
        this.actionObject = actionObject;
        this.name = name;
        this.description = description;
        this.url = url;
        this.automationInterrupt = automationInterrupt;
        this.possibleReasonsForElementNotFound = possibleReasonsForElementNotFound;
        this.id = id;
    }
}

function isStepCompleted(step) {
    return ((
        isRedirectCompleted(step.actionObject) ||
        isClickActionCompleted(step.actionObject) ||
        isInputCompleted(step.actionObject) ||
        isSelectCompleted(step.actionObject) ||
        isSideInstructionCompleted(step.actionObject)) &&
        isNotNull(step.index) &&
        step.actionType !== VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL &&
        typeof step.actionObject !== 'NullAction'
    )
}


/**
 * Placeholder action class for initialization of step object
 */
class NullAction {

}

class RedirectAction {
    constructor(url) {
        this.url = url;
    }
}

function isRedirectCompleted(redirect) {
    return (isNotNull(redirect.url));
}


class ClickAction {
    /**
     * 
     * @param {ClickGuide} defaultClick
     * @param {[ClickGuide]} optionsClick 
     */
    constructor(defaultClick, optionsClick) {
        this.defaultClick = defaultClick;
        this.optionsClick = optionsClick;
    }
}

function isClickActionCompleted(click) {
    return isClickGuideCompleted(click.defaultClick);
}

/**
 * Helper class to wrap what to do during one click action step. Used in ClickAction
 */
class ClickGuide {
    /**
     * 
     * @param {[string]} path 
     * @param {string} name 
     * @param {string} description 
     * @param {boolean} isRedirect
     * @param {string} url
     */
    constructor(path, name, description, isRedirect, url, useAnythingInTable, table) {
        this.path = path;
        this.name = name;
        this.description = description;
        this.isRedirect = isRedirect;
        this.url = url;
        this.useAnythingInTable = useAnythingInTable;
        this.table = table;
    }
}

function isClickGuideCompleted(clickGuide) {
    return (
        isNotNull(clickGuide) &&
        isNotNull(clickGuide.path) &&
        clickGuide.path.length > 0 &&
        clickGuide.name !== null &&
        clickGuide.name !== "" &&
        isNotNull(clickGuide.isRedirect))
}

class InputAction {
    /**
     * Path is required. Default text used to fill input when selecting using default. 
     * If there is no default, automation halts and asks for input. If options exist,
     * automation halts when not using default and asks for input (options only used as
     * suggestions). 
     * @param {[string]} path 
     * @param {string} defaultText 
     * @param {[string]} optionsText 
     * @param {string} inputType 
     */
    constructor(path, defaultText, optionsText, inputType) {
        this.path = path;
        this.defaultText = defaultText;
        this.optionsText = optionsText;
        this.inputType = inputType;
    }
}

function isInputCompleted(input) {
    return (isNotNull(input.path) && input.path !== [] && isNotNull(input.defaultText) && input.inputType !== "");
}

class SelectAction {
    /**
     * 
     * @param {[string]} path path to the <select> element. not option
     * @param {string} defaultValue html value attribute, from VALUE.ACTION_TYPE
     */
    constructor(path, defaultValue) {
        this.path = path;
        this.defaultValue = defaultValue;
    }
}

function isSelectCompleted(select) {
    return (isNotNull(select.path) && select.path !== [] && select.defaultValue !== "")
}


class SideInstructionAction {
    constructor(path) {
        this.path = path;
    }
}

function isSideInstructionCompleted(si) {
    return (isNotNull(si.path) && si.path !== [])
}

class GlobalEventsHandler {
    constructor() {
        removeGlobalEventListenersWhenFollowing();
        removeGlobalEventListenersWhenRecording();
        this.tutorialStatusCache = VALUES.TUTORIAL_STATUS.BEFORE_INIT_NULL;
        this.isLisentingRecording = false;
        this.isLisentingFollowing = false;
        this.isAutomationInterrupt = false;
        this.isOnRightPage = true;
    }

    onChange() {
        //add or remove when recording or not recording
        if (this.tutorialStatusCache === VALUES.TUTORIAL_STATUS.IS_RECORDING) {
            if (!this.isLisentingRecording) {
                addGlobalEventListenersWhenRecording();
                this.isLisentingRecording = true;
            }
        } else {
            if (this.isLisentingRecording) {
                removeGlobalEventListenersWhenRecording();
                this.isLisentingRecording = false;
            }
        }

        if (this.isOnRightPage && (this.isAutomationInterrupt || (this.tutorialStatusCache === VALUES.TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL))) {
            if (!this.isLisentingFollowing) {
                addGlobalEventListenersWhenFollowing();
                this.isLisentingFollowing = true;
            }
        } else {
            if (this.isLisentingFollowing) {
                removeGlobalEventListenersWhenFollowing();
                this.isLisentingFollowing = false;
            }
        }
    }

    setTutorialStatusCache(tutorialStatusCache) {
        syncStorageSet(VALUES.TUTORIAL_STATUS.STATUS, tutorialStatusCache);
        this.tutorialStatusCache = tutorialStatusCache;
        this.onChange();
    }

    setIsAutomationInterrupt(isAutomationInterrupt) {
        this.isAutomationInterrupt = isAutomationInterrupt;
        this.onChange();
    }

    setIsOnRightPage(isOnRightPage) {
        this.isOnRightPage = isOnRightPage;
        this.onChange();
    }
}

class GlobalCache {
    constructor(
        tutorialObj = null,
        currentStep = null,
        interval = 2000,
        globalEventsHandler = new GlobalEventsHandler(),
        domPath = null,
        currentElement = null,
        reHighlightAttempt = 0,
        lastSelectedElement = null,
        lastSelectedElementCSS = null,
        currentJQScrollingParent = null,
    ) {
        this.tutorialObj = tutorialObj;
        this.currentStep = currentStep;
        this.interval = interval;
        this.globalEventsHandler = globalEventsHandler;
        this.domPath = domPath;
        this.currentElement = currentElement;
        this.reHighlightAttempt = reHighlightAttempt;
        this.lastHighlightedElement = lastSelectedElement;
        this.lastHighlightedElementCSS = lastSelectedElementCSS;
        this.currentJQScrollingParent = currentJQScrollingParent;
        this.alertElementInterval = null;
        this.sideInstructionAutoNextTimer = null;
        this.isMainPopUpCollapsed = false;
        this.reHighlightTimer = null;
        this.isRecordingButtonOn = false;
        this.speedBarValue = 50;
        const currentUrl = $(location).attr('href');
        this.currentUrl = currentUrl;
        this.currentURLObj = new URL(currentUrl);
    }


}