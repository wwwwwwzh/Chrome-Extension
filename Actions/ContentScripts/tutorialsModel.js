class TutorialsModel {
    #tutorials

    getCurrentTutorial() {
        return this.#tutorials[0];
    }

    getCurrentStep() {
        const currentTutorial = getCurrentTutorial();
        return currentTutorial.steps[currentTutorial.currentStepIndex];
    }

    checkIfCurrentURLMatchesPageURL() {
        const currentURL = this.getCurrentStep()?.url;
        return isNotNull(currentURL) && checkIfUrlMatch(currentURL, globalCache.currentUrl)
    }

    async initiateFromFirestore(tutorialsQuerySnapshot, callback = () => { }) {
        this.#tutorials = [];
        await Promise.all(tutorialsQuerySnapshot.docs.map(async (tutorial) => {
            const tutorialID = tutorial.id;
            const tutorialData = tutorial.data();

            uiManager.loadSingleTutorialButton(tutorialData, tutorialID);

            //get all information about the tutorial from firebase
            const stepsQuery = query(collection(ExtensionController.FIRESTORE_REF,
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

            this.#tutorials.push(new TutorialObject(tutorialData.name, '', [], steps, tutorialData.all_urls, tutorialID));
        }));
        this.saveToStorage(callback);
        //TODO: Change to better place for speed optimization
        uiManager.createSnapshotsForAllTutorials();
    }

    loadFromStorage(callback = () => { }) {
        chrome.storage.sync.get([VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL, VALUES.STORAGE.ALL_OTHER_TUTORIALS], (result) => {
            const currentTutorial = result[VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL];
            const allOtherTutorials = result[VALUES.STORAGE.ALL_OTHER_TUTORIALS];
            this.#tutorials = [currentTutorial, ...allOtherTutorials];
            console.log('loading ' + this.#tutorials.length + ' tutorials from storage')
            callback();
        });
    }

    loadCurrentTutorialFromStorage(callback = () => { }) {
        chrome.storage.sync.get([VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL], (result) => {
            const currentTutorial = result[VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL];
            if (this.#tutorials.length > 0) {
                this.#tutorials[0] = currentTutorial;
            } else {
                this.#tutorials = [currentTutorial];
            }
            callback();
        });
    }

    /**
     * Save all tuutorials on page to storage.
     * @param {*} callback 
     */
    saveToStorage(callback = () => { }) {
        console.log('saving ' + this.#tutorials.length + ' tutorials to storage')
        syncStorageSetBatch({
            [VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL]: this.#tutorials[0],
            [VALUES.STORAGE.ALL_OTHER_TUTORIALS]: this.#tutorials.slice(1),
        }, callback);
    }

    /**
     * Save current active tutorial to storage
     * @param {*} callback 
     */
    saveCurrentTutorialToStorage(callback = () => { }) {
        console.log('saving current tutorials to storage')
        syncStorageSet([VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL], this.#tutorials[0], callback);
    }

    getFirstStepIndexOnCurrentPage() {
        var firstStepIndexOnCurrentPage = -1;
        this.#tutorials[0].steps.some((step, index) => {
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
    onCreatingNewRecording() {
        this.#tutorials.unshift(new TutorialObject());
        this.onCreatingNewStep(true);
        this.saveToStorage();
    }

    onCreatingNewStep(firstStep = false) {
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

            this.#tutorials[0].steps.push(step);
            this.syncFromCurrentStepStorageToUIWhenRecording();
        } else {
            //save inputs
            this.syncFromUIToCurrentTutorialWhenRecording(() => {
                this.#tutorials[0].currentStepIndex = this.#tutorials[0].steps.push(step) - 1;
                //update
                uiManager.updateStepSnapshot(this.#tutorials[0].steps[this.#tutorials[0].currentStepIndex - 1].id);

                uiManager.createStepSnapshot(this.#tutorials[0].currentStepIndex, {
                    url: globalCache.currentUrl,
                    name: '',
                    description: '',
                    id: id,
                })
            });
            //update UI to new step
            this.syncFromCurrentStepStorageToUIWhenRecording();
        }
    }

    onCurrentStepChangedWhenRecording(newStepIndex) {
        this.syncFromUIToCurrentTutorialWhenRecording();
        this.#tutorials[0].currentStepIndex = newStepIndex;
        this.syncFromCurrentStepStorageToUIWhenRecording();
    }

    /**
     * Sync from storage to UI
     */
    syncFromCurrentStepStorageToUIWhenRecording() {
        //elements to ui
        const currentStep = this.getCurrentStep();
        stepNameInput.attr('value', currentStep.name);
        stepNameInput.val('');
        stepDescriptionInput.attr('value', currentStep.description);
        stepDescriptionInput.val('');
    }

    /**
     * Sync UI to storage
     */
    syncFromUIToCurrentTutorialWhenRecording(callback = () => { }) {
        chrome.storage.sync.get([VALUES.STORAGE.CURRENT_SELECTED_ELEMENT], result => {
            const path = result[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT];
            if (!isNotNull(path) || isEmpty(path)) {
                alert("Please complete required fields first");
                return;
            }

            const stepIndex = this.#tutorials[0].currentStepIndex;
            const tempStep = this.#tutorials[0].steps[stepIndex];
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

            this.#tutorials[0].steps[stepIndex] = step;
            //save current step to sync
            this.saveCurrentTutorialToStorage(callback);
            console.log('saving current tutorial: ' + JSON.stringify(this.getCurrentTutorial()));
        });


    }

    uploadToFirestoreOnFinishRecording() {

    }

    //------------------------------------------------------------------------------------------
    //following tutorial functions
    //------------------------------------------------------------------------------------------
    onFollowingStep(stepIndex) {
        if (stepIndex >= this.#tutorials[0].steps.length) {
            onStopTutorialButtonClicked();
            return;
        }
        this.#tutorials[0].currentStepIndex = stepIndex;
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
        if (this.#tutorials.length > 1) {
            var tutorialToFollowIndex;
            this.#tutorials.forEach((tutorial, index) => {
                if (tutorial.id === tutorialID) {
                    tutorialToFollowIndex = index;
                }
            });
            const temp = this.#tutorials[0];
            this.#tutorials[0] = this.#tutorials[tutorialToFollowIndex];
            this.#tutorials[tutorialToFollowIndex] = temp;
            this.saveToStorage(() => {
                this.onFollowingStep(0)
            });
        }
    }

    showCurrentStep() {
        const currentStep = this.getCurrentStep();

        if (this.checkIfCurrentURLMatchesPageURL()) {
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
        this.#tutorials[0].currentStepIndex = 0;
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
}