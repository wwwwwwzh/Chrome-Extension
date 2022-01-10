class UIManager {
    constructor() {
    }

    //------------------------------------------------------------------------------------------
    //general
    //------------------------------------------------------------------------------------------
    onFetchingTutorialsFromCloud() {
        $('.w-not-following-tutorial-item').remove();
        automationSpeedSliderHelper();
    }



    //------------------------------------------------------------------------------------------
    //recording 
    //------------------------------------------------------------------------------------------


    /**
     * 
     * @param {*} atIndex 
     * @param {*} snapshot {url, name, description, id}
     */
    createStepSnapshot(atIndex, snapshot) {
        const steps = tutorialsManager.tutorials[0].steps;
        const prevStep = steps[atIndex - 1] || null;
        const nextStep = steps[atIndex] || null;
        const trimmedURL = snapshot.url;

        console.log(JSON.stringify(prevStep))
        if (isNotNull(prevStep) && prevStep.url === snapshot.url) {
            console.log('apending step snapshot')
            const container = $(`#${prevStep.id}`).parent();
            container.append(`
            <div id="${snapshot.id}" class="step-snapshot-container w-horizontal-scroll-item-container">
                <!-- snapshot -->
                <label for="">${snapshot.name}</label>
                <label for="">${snapshot.description}</label>
            </div>
            <div class="w-horizontal-scroll-item-next-indicator-container w-horizontal-scroll-item-container">
                <div class="w-horizontal-scroll-item-next-indicator"></div>
            </div>
            `)
        } else if (isNotNull(nextStep) && nextStep.url === snapshot.url) {
            console.log('prepending step snapshot')
            const container = $(`#${nextStep.id}`).parent();
            container.prepend(`
            <div id="${snapshot.id}" class="step-snapshot-container w-horizontal-scroll-item-container">
                <!-- snapshot -->
                <label for="">${snapshot.name}</label>
                <label for="">${snapshot.description}</label>
            </div>
            <div class="w-horizontal-scroll-item-next-indicator-container w-horizontal-scroll-item-container">
                <div class="w-horizontal-scroll-item-next-indicator"></div>
            </div>
            `)
        } else {
            console.log('appending page contaner')
            addNewStepRoundButton.parent().before(`
            <div class="w-recording-panel-steps-section-container w-horizontal-scroll-item-container">
                <div class="w-recording-panel-steps-page-indicator-container">
                ${trimmedURL}
                </div>
                <div class="w-horizontal-scroll-container w-recording-panel-steps-step-indicator-container">
                    <div id="${snapshot.id}" class="step-snapshot-container w-horizontal-scroll-item-container">
                        <!-- snapshot -->
                        <label for="">${snapshot.name}</label>
                        <label for="">${snapshot.description}</label>
                    </div>
                    <div class="w-horizontal-scroll-item-next-indicator-container w-horizontal-scroll-item-container">
                        <div class="w-horizontal-scroll-item-next-indicator"></div>
                    </div>
                </div>
            </div>
            `);
        }
    }

    updateStepSnapshot(id) {
        console.log('updating' + id)
    }

    createTutorialStepsSnapshots(tutorialIndex = 0) {
        const steps = tutorialsManager.tutorials[tutorialIndex].steps;
        steps.forEach((step, index) => {
            uiManager.createStepSnapshot(index, step)
        })
    }

    createSnapshotsForAllTutorials() {
        tutorialsManager.tutorials.forEach((tutorial, index) => {
            tutorial.steps.forEach((step, index) => {
                if (step.url === globalCache.currentUrl) {
                    if (index !== 0) {
                        const container = $(`#tutorial-recording-snapshot-${tutorial.id}`).parent().parent();
                        container.append(`
                        <div
                            class="w-horizontal-scroll-item-container w-recording-advanced-panel-steps-section-container w-horizontal-scroll-container">
                            <div id="${step.id}" class="step-snapshot-container w-horizontal-scroll-item-container">
                                <!-- snapshot -->
                                <label for="">${step.name}</label>
                                <label for="">${step.description}</label>
                            </div>
                            <div class="w-horizontal-scroll-item-next-indicator-container w-horizontal-scroll-item-container">
                                <div class="w-horizontal-scroll-item-next-indicator">
                                </div>
                            </div>
                        </div>
                        `)
                    } else {
                        recordingAdvancedSectionContainer.append(`
                        <div class="w-horizontal-scroll-container w-recording-panel-advanced-steps-container">
                            <div
                                class="w-horizontal-scroll-item-container w-recording-advanced-panel-steps-section-container w-horizontal-scroll-container">
                                <div id="tutorial-recording-snapshot-${tutorial.id}" class="step-snapshot-container w-horizontal-scroll-item-container">
                                    <!-- snapshot -->
                                    ${tutorial.name}
                                </div>
                            </div>
                            <!-- step selector -->
                            <div
                                class="w-horizontal-scroll-item-container w-recording-advanced-panel-steps-section-container w-horizontal-scroll-container">
                                <div id="${step.id}" class="step-snapshot-container w-horizontal-scroll-item-container">
                                    <!-- snapshot -->
                                    <label for="">${step.name}</label>
                                    <label for="">${step.description}</label>
                                </div>
                                <div class="w-horizontal-scroll-item-next-indicator-container w-horizontal-scroll-item-container">
                                    <div class="w-horizontal-scroll-item-next-indicator">
                                    </div>
                                </div>
                            </div>
                        </div>
                        `);
                    }
                }
            })
        })
    }

    //------------------------------------------------------------------------------------------
    //following
    //------------------------------------------------------------------------------------------
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
 * 
 */
class TutorialsManager {
    /**
     * Should be called ONLY ONCE when creating the global variable.
     * @param {[TutorialObject]} tutorials 
     */
    constructor() {
        this.tutorials = [];
    }

    compressTutorial(uncompressedTutorial) {
        var compressedTutorial = {};
        compressedTutorial['n'] = uncompressedTutorial.name;
        compressedTutorial['d'] = uncompressedTutorial.description;
        compressedTutorial['s'] = uncompressedTutorial.snapshot;
        compressedTutorial['csi'] = uncompressedTutorial.currentStepIndex;
        compressedTutorial['id'] = uncompressedTutorial.id;
        compressedTutorial['u'] = uncompressedTutorial.urls;

        var compressedSteps = [];
        uncompressedTutorial.steps.forEach((step, indx) => {
            compressedSteps.push({
                i: step.index,
                at: step.actionType,
                ao: step.actionObject,
                n: step.name,
                d: step.description,
                u: step.url,
                ai: step.automationInterrupt,
                rfnf: step.possibleReasonsForElementNotFound,
                id: step.id,
            })
        })

        compressedTutorial.steps = compressedSteps;

        return compressedTutorial;
    }

    decompressTutorial(compressedTutorial) {
        var decompressedTutorial = new TutorialObject();
        decompressedTutorial.name = compressedTutorial['n'];
        decompressedTutorial.description = compressedTutorial['d'];
        decompressedTutorial.snapshot = compressedTutorial['s'];
        decompressedTutorial.currentStepIndex = compressedTutorial['csi'];
        decompressedTutorial.id = compressedTutorial['id'];
        decompressedTutorial.urls = compressedTutorial['u'];

        var decompressedSteps = []
        compressedTutorial.steps.forEach((step, indx) => {
            decompressedSteps.push(new Step(
                step['i'],
                step['at'],
                step['ao'],
                step['n'],
                step['d'],
                step['u'],
                step['ai'],
                step['rfnf'],
                step['id'],
            ))
        })

        decompressedTutorial.steps = decompressedSteps;

        return decompressedTutorial;
    }

    getCurrentTutorial() {
        return tutorialsManager.tutorials[0];
    }

    getCurrentStep() {
        const currentTutorial = tutorialsManager.tutorials[0];
        return currentTutorial.steps[currentTutorial.currentStepIndex];
    }

    checkIfCurrentURLMatchesPageURL() {
        const currentURL = tutorialsManager.getCurrentStep()?.url;
        return isNotNull(currentURL) && checkIfUrlMatch(currentURL, globalCache.currentUrl)
    }

    async initiateFtomFirestore(tutorialsQuerySnapshot, callback = () => { }) {
        tutorialsManager.tutorials = [];
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
                //remove steps used prior to accessing tutorialsManager page
                if (isFirstStepReached) {
                    steps.push(data);
                } else {

                    if (checkIfUrlMatch(data.url, globalCache.currentUrl)) {
                        isFirstStepReached = true;
                        steps.push(data);
                    }
                }
            })

            tutorialsManager.tutorials.push(new TutorialObject(tutorialData.name, '', [], steps, tutorialData.all_urls, tutorialID));
        }));
        tutorialsManager.saveToStorage(callback);
        //TODO: Change to better place for speed optimization
        uiManager.createSnapshotsForAllTutorials();
    }

    loadFromStorage(callback = () => { }) {
        chrome.storage.sync.get([VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL, VALUES.STORAGE.ALL_OTHER_TUTORIALS], (result) => {
            const currentTutorial = result[VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL];
            const allOtherTutorials = result[VALUES.STORAGE.ALL_OTHER_TUTORIALS];
            tutorialsManager.tutorials = [currentTutorial, ...allOtherTutorials];
            console.log('loading ' + tutorialsManager.tutorials.length + ' tutorials from storage')
            callback();
        });
    }

    loadCurrentTutorialFromStorage(callback = () => { }) {
        chrome.storage.sync.get([VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL], (result) => {
            const currentTutorial = result[VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL];
            if (tutorialsManager.tutorials.length > 0) {
                tutorialsManager.tutorials[0] = currentTutorial;
            } else {
                tutorialsManager.tutorials = [currentTutorial];
            }
            callback();
        });
    }

    /**
     * Save all tuutorials on page to storage.
     * @param {*} callback 
     */
    saveToStorage(callback = () => { }) {
        console.log('saving ' + tutorialsManager.tutorials.length + ' tutorials to storage')
        syncStorageSetBatch({
            [VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL]: tutorialsManager.tutorials[0],
            [VALUES.STORAGE.ALL_OTHER_TUTORIALS]: tutorialsManager.tutorials.slice(1),
        }, callback);
    }

    /**
     * Save current active tutorial to storage
     * @param {*} callback 
     */
    saveCurrentTutorialToStorage(callback = () => { }) {
        console.log('saving current tutorials to storage')
        syncStorageSet([VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL], tutorialsManager.tutorials[0], callback);
    }

    getFirstStepIndexOnCurrentPage() {
        var firstStepIndexOnCurrentPage = -1;
        tutorialsManager.tutorials[0].steps.some((step, index) => {
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
        tutorialsManager.tutorials.unshift(new TutorialObject());
        tutorialsManager.onCreatingNewStep(true);
        tutorialsManager.saveToStorage();
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

            tutorialsManager.tutorials[0].steps.push(step);
            tutorialsManager.syncFromCurrentStepStorageToUIWhenRecording();
        } else {
            //save inputs
            tutorialsManager.syncFromUIToCurrentTutorialWhenRecording(() => {
                tutorialsManager.tutorials[0].currentStepIndex = tutorialsManager.tutorials[0].steps.push(step) - 1;
                //update
                uiManager.updateStepSnapshot(tutorialsManager.tutorials[0].steps[tutorialsManager.tutorials[0].currentStepIndex - 1].id);

                uiManager.createStepSnapshot(tutorialsManager.tutorials[0].currentStepIndex, {
                    url: globalCache.currentUrl,
                    name: '',
                    description: '',
                    id: id,
                })
            });
            //update UI to new step
            tutorialsManager.syncFromCurrentStepStorageToUIWhenRecording();
        }
    }

    onCurrentStepChangedWhenRecording(newStepIndex) {
        tutorialsManager.syncFromUIToCurrentTutorialWhenRecording();
        tutorialsManager.tutorials[0].currentStepIndex = newStepIndex;
        tutorialsManager.syncFromCurrentStepStorageToUIWhenRecording();
    }

    /**
     * Sync from storage to UI
     */
    syncFromCurrentStepStorageToUIWhenRecording() {
        //elements to ui
        const currentStep = tutorialsManager.getCurrentStep();
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

            const stepIndex = tutorialsManager.tutorials[0].currentStepIndex;
            const tempStep = tutorialsManager.tutorials[0].steps[stepIndex];
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

            tutorialsManager.tutorials[0].steps[stepIndex] = step;
            //save current step to sync
            tutorialsManager.saveCurrentTutorialToStorage(callback);
            console.log('saving current tutorial: ' + JSON.stringify(tutorialsManager.getCurrentTutorial()));
        });


    }

    uploadToFirestoreOnFinishRecording() {

    }

    //------------------------------------------------------------------------------------------
    //following tutorial functions
    //------------------------------------------------------------------------------------------
    onFollowingStep(stepIndex) {
        if (stepIndex >= tutorialsManager.tutorials[0].steps.length) {
            onStopTutorialButtonClicked();
            return;
        }
        tutorialsManager.tutorials[0].currentStepIndex = stepIndex;
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
        if (tutorialsManager.tutorials.length > 1) {
            var tutorialToFollowIndex;
            tutorialsManager.tutorials.forEach((tutorial, index) => {
                if (tutorial.id === tutorialID) {
                    tutorialToFollowIndex = index;
                }
            });
            const temp = tutorialsManager.tutorials[0];
            tutorialsManager.tutorials[0] = tutorialsManager.tutorials[tutorialToFollowIndex];
            tutorialsManager.tutorials[tutorialToFollowIndex] = temp;
            tutorialsManager.saveToStorage(() => {
                tutorialsManager.onFollowingStep(0)
            });
        }
    }

    showCurrentStep() {
        const currentStep = tutorialsManager.getCurrentStep();

        if (tutorialsManager.checkIfCurrentURLMatchesPageURL()) {
            $('.w-following-tutorial-item').show();
            tutorialsManager.onFollowingStep(tutorialsManager.getCurrentTutorial().currentStepIndex);

        } else {
            uiManager.onOnWrongPage(currentStep);
        }
    }

    onFollowingNextStep() {
        tutorialsManager.onFollowingStep(++tutorialsManager.getCurrentTutorial().currentStepIndex);
        tutorialsManager.saveCurrentTutorialToStorage();
    }

    revertCurrentTutorialToInitialState() {
        tutorialsManager.tutorials[0].currentStepIndex = 0;
        tutorialsManager.saveCurrentTutorialToStorage();
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
        this.isUsingAdvancedRecordingPanel = false;
    }


}