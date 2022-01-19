class TutorialsModel {
    static #tutorials
    static #urlAssociatedWithCurrentTutorialsQuerySnapshot
    static #lastSavedTimestamp

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

    static forEachTutorial(doThis) {
        this.#tutorials.forEach((tutorial, index) => {
            doThis(tutorial, index)
        })
    }

    //initialize methods

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
        const url_matches = [globalCache.currentUrl, domainName];
        return query(collection(ExtensionController.SHARED_FIRESTORE_REF,
            VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL),
            where(
                VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL_ALL_URLS,
                VALUES.FIRESTORE_QUERY_TYPES.ARRAY_CONTAINS_ANY,
                url_matches
            )
        );
    }

    static async checkIfAnyTutorialExistsOnPage() {
        if (TutorialsModel.#checkIfReloadIsNeeded()) {
            await TutorialsModel.#getTutorialsQuerySnapshot()
        }
        return !TutorialsModel.#tutorialsQuerySnapshot.empty
    }

    static async #getTutorialsQuerySnapshot() {
        TutorialsModel.#tutorialsQuerySnapshot = await getDocs(TutorialsModel.#getMatchedTutorialsQuery());
    }

    static #checkIfReloadIsNeeded() {
        const result = TutorialsModel.#urlAssociatedWithCurrentTutorialsQuerySnapshot !== globalCache.currentURL || checkIfPassedReloadTime()
        if (result) {
            TutorialsModel.#urlAssociatedWithCurrentTutorialsQuerySnapshot = globalCache.currentURL
            TutorialsModel.#lastSavedTimestamp = Date.now()
        }
        return result

        function checkIfPassedReloadTime() {
            return ((Date.now() / 60000 | 0) - (TutorialsModel.#lastSavedTimestamp / 60000 | 0)) > 3
        }
    }

    /**
     * Load new query from firestore and initialize model.
     * Should be used when forcing a new firestore query.
     * smartInit is preferred
     * @param {*} callback 
     */
    static async initializeFromFirestore(callback = () => { }) {
        await TutorialsModel.#getTutorialsQuerySnapshot()
        TutorialsModel.#tutorials = [];
        await TutorialsModel.#loadFromQuerySnapshot()
        TutorialsModel.saveToStorage(callback);
    }

    static async #loadFromQuerySnapshot() {
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
    }

    static async smartInit(callback) {
        if (TutorialsModel.#checkIfReloadIsNeeded()) {
            await TutorialsModel.initializeFromFirestore(callback)
        } else if (TutorialsModel.#tutorials?.length < 1) {
            await TutorialsModel.#loadFromQuerySnapshot()
        } else {
            TutorialsModel.loadFromStorage(callback)
        }
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
            TutorialsModel.#tutorials = [currentTutorial, ...allOtherTutorials];
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
        console.log('saving active tutorial to storage')
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
    static onCreatingNewRecording() {
        TutorialsModel.#tutorials.unshift(new TutorialObject());
        TutorialsModel.creatingNewStep(true);
        TutorialsModel.saveToStorage();
    }

    static creatingNewStep(firstStep = false) {
        //create snapshot, save current inputs, push new step object and update step index and UI

        //push to storage
        const id = uuidv4();
        const step = new Step();
        step.id = id;
        if (firstStep) {
            uiManager.createStepSnapshot(0, {
                url: globalCache.currentUrl,
                name: '',
                description: '',
                id: id,
            })

            TutorialsModel.#tutorials[0].steps.push(step);
            TutorialsModel.syncFromCurrentStepStorageToUIWhenRecording();
        } else {
            //save inputs
            TutorialsModel.syncFromUIToCurrentTutorialWhenRecording(() => {
                TutorialsModel.#tutorials[0].currentStepIndex = TutorialsModel.#tutorials[0].steps.push(step) - 1;
                //update
                uiManager.updateStepSnapshot(TutorialsModel.#tutorials[0].steps[TutorialsModel.#tutorials[0].currentStepIndex - 1].id);

                uiManager.createStepSnapshot(TutorialsModel.#tutorials[0].currentStepIndex, {
                    url: globalCache.currentUrl,
                    name: '',
                    description: '',
                    id: id,
                })
            });
            //update UI to new step
            TutorialsModel.syncFromCurrentStepStorageToUIWhenRecording();
        }
    }

    static onCurrentStepChangedWhenRecording(newStepIndex) {
        TutorialsModel.syncFromUIToCurrentTutorialWhenRecording();
        TutorialsModel.#tutorials[0].currentStepIndex = newStepIndex;
        TutorialsModel.syncFromCurrentStepStorageToUIWhenRecording();
    }

    /**
     * Sync from storage to UI
     */
    static syncFromCurrentStepStorageToUIWhenRecording() {
        //elements to ui
        const currentStep = TutorialsModel.getCurrentStep();
        stepNameInput.attr('value', currentStep.name);
        stepNameInput.val('');
        stepDescriptionInput.attr('value', currentStep.description);
        stepDescriptionInput.val('');
    }

    /**
     * Sync UI to storage
     */
    static syncFromUIToCurrentTutorialWhenRecording(callback = () => { }) {
        chrome.storage.sync.get([VALUES.STORAGE.CURRENT_SELECTED_ELEMENT], result => {
            const path = result[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT];
            if (!isNotNull(path) || isEmpty(path)) {
                alert("Please complete required fields first");
                return;
            }

            const stepIndex = TutorialsModel.#tutorials[0].currentStepIndex;
            const tempStep = TutorialsModel.#tutorials[0].steps[stepIndex];
            const actionType = parseInt(actionTypeSelector.val());
            var step = new Step(
                stepIndex,
                actionType,
                null,
                stepNameInput.attr('value'),
                stepDescriptionInput.attr('value'),
                globalCache.currentUrl,
                false,
                [],
                tempStep.id
            );
            console.log(stepNameInput.attr('value'))
            console.log(step.name)
            switch (actionType) {
                case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK:
                    step.actionObject = new ClickAction(new ClickGuide(path, null, null, false, null, false, null), []);
                    break;
                case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK_REDIRECT:
                    step.actionObject = new ClickAction(new ClickGuide(path, null, null, true, null, false, null), []);
                    break;
                case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_INPUT:
                    step.actionObject = new InputAction(path, "", [], false, VALUES.INPUT_TYPES.TEXT);
                    break;
                case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_REDIRECT:
                    step.actionObject = new RedirectAction(stepRedirectURLInput);
                    break;
                case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_SIDE_INSTRUCTION:
                    step.actionObject = new SideInstructionAction(path);
                    break;
                default:
                    break;
            }

            TutorialsModel.#tutorials[0].steps[stepIndex] = step;
            //save current step to sync
            TutorialsModel.saveActiveTutorialToStorage(callback);
            console.log('saving current tutorial: ' + JSON.stringify(TutorialsModel.getCurrentTutorial()));
        });


    }

    static uploadToFirestoreOnFinishRecording() {

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

    static changeCurrentTutorialStepIndexTo(index) {
        TutorialsModel.#tutorials[0].currentStepIndex = index;
        TutorialsModel.saveActiveTutorialToStorage();
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

    static getPath(step) {
        return Step.callFunctionOnActionType(
            step.actionType,
            () => { return ClickAction.getPath(step.actionObject) },
            () => { return ClickAction.getPath(step.actionObject) },
            () => { return InputAction.getPath(step.actionObject) },
            () => { return RedirectAction.getPath(step.actionObject) },
            () => { return SelectAction.getPath(step.actionObject) },
            () => { return SideInstructionAction.getPath(step.actionObject) },
            () => { return NullAction.getPath(step.actionObject) },
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
            isNotNull(step.index) &&
            step.actionType !== VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL &&
            typeof step.actionObject !== 'NullAction'
        )
    }
}