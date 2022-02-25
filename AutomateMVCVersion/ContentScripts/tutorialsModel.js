class TutorialsModel {
    //Constants
    static LAST_SAVED_TIMESTAMP_KEY = 'LSTK'
    static URL_ASSOCIATED_WITH_CURRENT_TUTORIAL_QUERY_SNAPSHOT_KEY = 'UAWCTQS'

    //local variables
    static #tutorials = []
    static #tutorialsQuerySnapshot

    /**
     * 
     */
    static tutorialsModelFollowingTutorialDelegate

    //getter methods
    static getCurrentTutorial() {
        return TutorialsModel.#tutorials[0];
    }

    static getCurrentStep() {
        const currentTutorial = TutorialsModel.getCurrentTutorial();
        return currentTutorial.steps[currentTutorial.currentStepIndex];
    }

    static getCurrentStepIndex() {
        return TutorialsModel.getCurrentTutorial().currentStepIndex;
    }

    static getLastStepIndexForTutorial(tutorialIndex = 0) {
        return TutorialsModel.#tutorials[tutorialIndex].steps.length - 1;
    }

    static forEachTutorial(fn) {
        this.#tutorials.forEach((tutorial, index) => {
            fn(tutorial, index)
        })
    }

    static getTutorialAtIndex(index) {
        return TutorialsModel.#tutorials[index];
    }

    static getFirstStepOfTutorialAtIndex(index) {
        return TutorialsModel.#tutorials[index].steps[0]
    }

    static getStepOfTutorialAtIndex(tutorialIndex, stepIndex) {
        return TutorialsModel.#tutorials[tutorialIndex].steps[stepIndex]
    }

    static getStepOfCurrentTutorialAtIndex(index) {
        return TutorialsModel.#tutorials[0].steps[index]
    }

    //initialization methods

    /**
     * 
     * @returns True if the current tutorial model's current step url matches user's url
     */
    static checkIfCurrentURLMatchesPageURL() {
        const currentURL = TutorialsModel.getCurrentStep()?.url;
        return isNotNull(currentURL) && checkIfUrlMatch(currentURL, globalCache.currentUrl)
    }

    static #getMatchedTutorialsQuery() {
        const domainName = "https://" + globalCache.currentURLObj.hostname + "/";
        const url_matches = [globalCache.currentUrl];
        return query(collection(ExtensionController.SHARED_FIRESTORE_REF,
            VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL),
            where(
                VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL_ALL_URLS,
                VALUES.FIRESTORE_QUERY_TYPES.ARRAY_CONTAINS_ANY,
                url_matches
            )
        );
    }

    static async checkIfAnyTutorialExistsOnPage(callBackWhenExists, callbackWhenNot = () => { }) {
        TutorialsModel.#getTutorialsQuerySnapshotFromFirestore(() => {
            TutorialsModel.#tutorialsQuerySnapshot.empty ? callbackWhenNot() : callBackWhenExists()
        })
    }

    /**
     * This will fetch all tutorials on page to local private variable tutorialsQuerySnapshot
     */
    static async #getTutorialsQuerySnapshotFromFirestore(callback = () => { }) {
        TutorialsModel.#tutorialsQuerySnapshot = await getDocs(TutorialsModel.#getMatchedTutorialsQuery());
        callback()
    }

    static #checkIfReloadIsNeeded(reloadFunc = () => { }, noReloadFunc = () => { }) {
        if (UserEventListnerHandler.tutorialStatusCache === VALUES.TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL ||
            UserEventListnerHandler.tutorialStatusCache === VALUES.TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL) {
            noReloadFunc()
            return
        }

        chrome.storage.sync.get([TutorialsModel.LAST_SAVED_TIMESTAMP_KEY, TutorialsModel.URL_ASSOCIATED_WITH_CURRENT_TUTORIAL_QUERY_SNAPSHOT_KEY], (result) => {
            const lastSavedTimestamp = result[TutorialsModel.LAST_SAVED_TIMESTAMP_KEY]
            const urlAssociatedWithCurrentTutorialsQuerySnapshot = result[TutorialsModel.URL_ASSOCIATED_WITH_CURRENT_TUTORIAL_QUERY_SNAPSHOT_KEY]
            const isPassedReloadTime = (((Date.now() / 60000 | 0) - (lastSavedTimestamp / 60000 | 0)) > 3)
            // c('last' + urlAssociatedWithCurrentTutorialsQuerySnapshot + '   |now:' + globalCache.currentUrl)
            const isReload = urlAssociatedWithCurrentTutorialsQuerySnapshot !== globalCache.currentUrl || isPassedReloadTime
            if (isReload) {
                var data = {}
                data[TutorialsModel.LAST_SAVED_TIMESTAMP_KEY] = Date.now()
                data[TutorialsModel.URL_ASSOCIATED_WITH_CURRENT_TUTORIAL_QUERY_SNAPSHOT_KEY] = globalCache.currentUrl
                syncStorageSetBatch(data)
                reloadFunc()
            } else {
                noReloadFunc()
            }
        })
    }

    /**
     * Load new query from firestore and initialize model.
     * Should be used when forcing a new firestore query.
     * smartInit is preferred
     * @param {*} callback 
     */
    static async initializeFromFirestore(callback = () => { }) {
        await TutorialsModel.#getTutorialsQuerySnapshotFromFirestore()
        TutorialsModel.#tutorials = [];
        await TutorialsModel.#loadFromQuerySnapshot(callback)
    }

    static async #loadFromQuerySnapshot(callback = () => { }) {
        await Promise.all(TutorialsModel.#tutorialsQuerySnapshot.docs.map(async (tutorial) => {
            const tutorialID = tutorial.id;
            const tutorialData = tutorial.data();

            //get all information about the tutorial from firebase
            const stepsQuery = query(collection(ExtensionController.SHARED_FIRESTORE_REF,
                VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL,
                tutorialID,
                VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL_STEPS
            ), orderBy(VALUES.FIRESTORE_CONSTANTS.STEP_INDEX));
            const stepsQuerySnapshot = await getDocs(stepsQuery);
            //construct steps array from query
            var steps = [];
            //TODO!: solve url problem (possibly using regex)
            var isFirstStepReached = false;
            stepsQuerySnapshot.forEach((step, index) => {
                const data = step.data();
                data.id = step.id;
                data.getPath = Step.prototype.getPath
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

            const tutorialObj = new TutorialObject(tutorialData.name, '', [], steps, tutorialData.all_urls, tutorialID)
            TutorialsModel.#tutorials.push(tutorialObj);
        }));
        TutorialsModel.saveToStorage(callback);
    }

    static async smartInit(callback) {
        TutorialsModel.#checkIfReloadIsNeeded(() => {
            c('reloading from firestore')
            if (UserEventListnerHandler.tutorialStatusCache === VALUES.TUTORIAL_STATUS.IS_RECORDING ||
                UserEventListnerHandler.tutorialStatusCache === VALUES.TUTORIAL_STATUS.IS_CREATING_NEW_TUTORIAL) {
                chrome.storage.sync.get([VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL], async (result) => {
                    const currentTutorial = result[VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL];
                    TutorialsModel.initializeFromFirestore(() => {
                        TutorialsModel.#tutorials.unshift(currentTutorial)
                        TutorialsModel.saveToStorage(callback);
                    })
                });
            } else {
                TutorialsModel.initializeFromFirestore(callback)
            }
        }, () => {
            chrome.storage.sync.get([VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL, VALUES.STORAGE.ALL_OTHER_TUTORIALS], async (result) => {
                const currentTutorial = result[VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL];
                if (isNotNull(currentTutorial)) {

                    const allOtherTutorials = result[VALUES.STORAGE.ALL_OTHER_TUTORIALS];
                    TutorialsModel.#tutorials = [currentTutorial]
                    isNotNull(allOtherTutorials) && !isArrayEmpty(allOtherTutorials) && TutorialsModel.#tutorials.push(allOtherTutorials)
                    console.log('loading ' + TutorialsModel.#tutorials.length + ' tutorials from storage')
                    callback();
                } else {
                    console.log('loadFromQuerySnapshot')
                    TutorialsModel.#loadFromQuerySnapshot(callback)
                }
            });
        })
    }

    /**
     * Initialize tutorials from chrome.storage.sync. Use cases might include refreshing pages or 
     * going to new pages. smartInit is preferred
     * @param {*} callback 
     */
    static loadFromStorage(callback = () => { }) {
        chrome.storage.sync.get([VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL, VALUES.STORAGE.ALL_OTHER_TUTORIALS], (result) => {
            const currentTutorial = result[VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL];
            const allOtherTutorials = result[VALUES.STORAGE.ALL_OTHER_TUTORIALS];
            TutorialsModel.#tutorials = [currentTutorial] ?? []
            allOtherTutorials && TutorialsModel.#tutorials.push(allOtherTutorials)

            console.log('loading ' + TutorialsModel.#tutorials.length + ' tutorials from storage')
            callback();
        });
    }

    /**
     * Initialize only the first tutorial.
     * @param {*} callback 
     */
    static loadActiveTutorialFromStorage(callback = () => { }) {
        chrome.storage.sync.get([VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL], (result) => {
            const currentTutorial = result[VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL];
            TutorialsModel.#tutorials = [currentTutorial];
            callback();
        });
    }

    /**
     * Save all tutorials to chrome.storage.sync
     * @param {*} callback 
     */
    static saveToStorage(callback = () => { }) {
        console.log('saving ' + TutorialsModel.#tutorials.length + ' tutorials to storage')
        syncStorageSetBatch({
            [VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL]: TutorialsModel.#tutorials[0],
            [VALUES.STORAGE.ALL_OTHER_TUTORIALS]: TutorialsModel.#tutorials.slice(1),
        }, callback);
    }

    /**
     * Save current active tutorial to storage
     * @param {*} callback 
     */
    static saveActiveTutorialToStorage(callback = () => { }) {
        console.log('saving active tutorial to storage' + TutorialsModel.#tutorials[0])
        syncStorageSet([VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL], TutorialsModel.#tutorials[0], callback);
    }

    static getFirstStepIndexOnCurrentPage() {
        var firstStepIndexOnCurrentPage = -1;
        TutorialsModel.#tutorials[0].steps.some((step, index) => {
            if (checkIfUrlMatch(step.url, globalCache.currentUrl)) {
                firstStepIndexOnCurrentPage = index;
                return true;
            }
        });
        return firstStepIndexOnCurrentPage;
    }

    //------------------------------------------------------------------------------------------
    //recording functions
    //------------------------------------------------------------------------------------------

    /**
     * Create new tutorial object and insert at front of tutorials array.
     * Then calls onCreatingNewStep() to create the first step.
     * After all is done, save the whole tutorial array back
     */
    static onCreateNewRecording() {
        TutorialsModel.#tutorials.unshift(new TutorialObject());
        const stepId = TutorialsModel.onCreateNewStep(true);
        TutorialsModel.saveToStorage();
        return stepId
    }

    static loadTutorialsOnPageWhenRecording(callback) {
        const currentTutorial = TutorialsModel.#tutorials[0]
        TutorialsModel.smartInit(() => {
            TutorialsModel.#tutorials.unshift(currentTutorial)
            callback()
        })
    }

    static onCreateNewStep() {
        const id = uuidv4();
        const step = new Step();
        step.id = id;
        if (TutorialsModel.getLastStepIndexForTutorial() < 0) {
            TutorialsModel.#tutorials[0].steps.push(step);
        } else {
            TutorialsModel.#tutorials[0].currentStepIndex = TutorialsModel.#tutorials[0].steps.push(step) - 1;
        }
        return id;
    }

    static updateCurrentStepWhenRecording(newStepIndex) {
        // TutorialsModel.syncFromUIToCurrentTutorialWhenRecording();
        // TutorialsModel.#tutorials[0].currentStepIndex = newStepIndex;
        // TutorialsModel.saveStep();
    }

    static saveTutorialBasicInfo(info, callback = () => { }) {
        TutorialsModel.#tutorials[0].name = info.name
        TutorialsModel.#tutorials[0].description = info.description
        TutorialsModel.saveActiveTutorialToStorage(callback)
    }

    static saveStep(step, atIndex, saveToStorage, callback = () => { }) {
        TutorialsModel.#tutorials[0].steps[atIndex] = step
        saveToStorage && TutorialsModel.saveActiveTutorialToStorage(callback)
    }

    static discardRecordingTutorial() {
        TutorialsModel.#tutorials.shift()
    }



    //------------------------------------------------------------------------------------------
    //following tutorial functions
    //------------------------------------------------------------------------------------------
    static changeActiveTutorialToChosen(tutorialID) {
        if (TutorialsModel.#tutorials.length > 1) {
            var tutorialToFollowIndex;
            TutorialsModel.#tutorials.forEach((tutorial, index) => {
                if (tutorial.id === tutorialID) {
                    tutorialToFollowIndex = index;
                }
            });
            const temp = TutorialsModel.#tutorials[0];
            TutorialsModel.#tutorials[0] = TutorialsModel.#tutorials[tutorialToFollowIndex];
            TutorialsModel.#tutorials[tutorialToFollowIndex] = temp;
            TutorialsModel.saveToStorage(() => {

            });
        }
    }

    static changeCurrentTutorialStepIndexTo(index, callback = () => { }) {
        if (TutorialsModel.#tutorials[0].currentStepIndex === index) {
            callback()
            return
        };
        TutorialsModel.#tutorials[0].currentStepIndex = index;
        TutorialsModel.saveActiveTutorialToStorage(callback);
    }

    static revertCurrentTutorialToInitialState() {
        TutorialsModel.changeCurrentTutorialStepIndexTo(0)
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
     * @param {number} actionType 
     * @param {RedirectAction | ClickAction | InputAction | SelectAction | SideInstructionAction | NullAction} actionObject 
     * @param {[string]} possibleReasonsForElementNotFound
     */
    constructor(
        index = 0,
        actionType = VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL,
        actionObject = {},
        name = '',
        description = '',
        url = globalCache.currentUrl,
        automationInterrupt = false,
        possibleReasonsForElementNotFound = [],
        id = null) {
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

    static getPath(step, index = 0) {
        return Step.callFunctionOnActionType(
            step.actionType,
            () => { return ClickAction.getPath(step.actionObject, index) },
            () => { return ClickAction.getPath(step.actionObject, index) },
            () => { return InputAction.getPath(step.actionObject, index) },
            () => { return RedirectAction.getPath(step.actionObject, index) },
            () => { return SelectAction.getPath(step.actionObject, index) },
            () => { return SideInstructionAction.getPath(step.actionObject, index) },
            () => { return NullAction.getPath(step.actionObject, index) },
        )
    }

    static callFunctionOnActionType(actionType, clickFunc, carFunc, inputFunc, redirectFunc, selectFunc, instructionFunc, nullFunc = null, defaultFunc = null) {
        switch (actionType) {
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL:
                return nullFunc?.();
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK: case "STEP_ACTION_TYPE_CLICK":
                return clickFunc?.();
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK_REDIRECT:
                return carFunc?.();
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_INPUT: case "STEP_ACTION_TYPE_INPUT":
                return inputFunc?.();
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_REDIRECT:
                return redirectFunc?.();
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_SELECT:
                return selectFunc?.();
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_SIDE_INSTRUCTION: case "STEP_ACTION_TYPE_SIDE_INSTRUCTION":
                return instructionFunc?.();
            default:
                return defaultFunc?.();
        }
    }

    static isStepCompleted(step) {
        return ((
            RedirectAction.isRedirectCompleted(step.actionObject) ||
            ClickAction.isClickActionCompleted(step.actionObject) ||
            InputAction.isInputCompleted(step.actionObject) ||
            SelectAction.isSelectCompleted(step.actionObject) ||
            SideInstructionAction.isSideInstructionCompleted(step.actionObject)) &&
            step.actionType !== VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL
        )
    }
}