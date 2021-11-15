async function onFollowTutorialButtonClicked(tutorialID) {
    //toogle html elements
    globalCache.reHighlightAttempt = 0;
    $('.w-follow-tutorial-options-item').show();
    $('.w-not-following-tutorial-item').remove();
    popUpNextStepButton.hide();

    automationSpeedSliderHelper();

    popUpAutomateButton.on('click', () => {
        onFollowTutorialTypeButtonClicked(VALUES.TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL, tutorialID);
    });

    popUpManualButton.on('click', () => {
        onFollowTutorialTypeButtonClicked(VALUES.TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL, tutorialID);
    });
}

function onFollowTutorialTypeButtonClicked(type, tutorialID) {
    showFollowingTutorialItems();
    syncStorageSet(VALUES.TUTORIAL_STATUS.STATUS, type);
    globalCache.globalEventsHandler.setTutorialStatusCache(type);
    tutorialsManager.onFollowingNewTutorial(tutorialID);

}

async function onStopTutorialButtonClicked() {
    //clear stuff
    clearUIOnNextStep();
    $('.w-following-tutorial-item, .w-follow-tutorial-options-item, .w-highlight-instruction-window').hide();

    const data = {};
    data[VALUES.TUTORIAL_STATUS.STATUS] = VALUES.TUTORIAL_STATUS.IDLE;
    data[VALUES.STORAGE.REVISIT_PAGE_COUNT] = 0;
    syncStorageSetBatch(data);

    globalCache = new GlobalCache();

    // tutorialsManager.revertCurrentTutorialToInitialState();
    // uiManager.loadTutorialButtonsFromCache();
    //TODO: use local cache and find correct index
    tutorialsManager = new TutorialsManager();
    fetchTutorialsFromCloud();
}

//INCOMPLETE
function onEnteredWrongPage(tutorialObj, urlToMatch) {
    for (let i = 0; i < tutorialObj.steps.length; i++) {
        const currentStep = tutorialObj.steps[i];
        if (currentStep.url === urlToMatch) {
            //show the matched step
            tutorialObj.currentStep = i;
            const RPCKey = VALUES.STORAGE.REVISIT_PAGE_COUNT;
            chrome.storage.sync.get([RPCKey], result => {
                if (result[RPCKey] > VALUES.STORAGE.MAX_REVISIT_PAGE_COUNT) {
                    alert('no matching page');
                    onStopTutorialButtonClicked();
                    return false;
                }
                syncStorageSet(RPCKey, result[RPCKey] + 1, () => {
                    syncStorageSet(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, tutorialObj, () => {
                        showTutorialStepAuto();

                        return true;
                    });
                })
            })
        }
    }
}

async function chooseFunctionAccordingToCurrentStepType(onStepActionClick, onStepActionClickRedirect, onStepActionRedirect, onStepActionInput, onStepActionSelect, onStepSideInstruction) {
    const tutorialObj = tutorialsManager.getCurrentTutorial();
    const currentStep = tutorialsManager.getCurrentStep();
    const interval = intervalFromSpeed(globalCache.speedBarValue);

    globalCache.interval = interval;

    if (tutorialObj.currentStepIndex >= tutorialObj.steps.length) {
        onStopTutorialButtonClicked();
    }
    // else if (currentUrl !== currentStep.url) {
    //     //onEnteredWrongPage(tutorialObj, currentStep.url);
    // } 
    else {
        //syncStorageSet(VALUES.STORAGE.REVISIT_PAGE_COUNT, 0);
        switch (currentStep.actionType) {
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK:
                //alert('bingo')
                isNotNull(onStepActionClick) && onStepActionClick();
                break;
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK_REDIRECT:
                isNotNull(onStepActionClickRedirect) && onStepActionClickRedirect(false);
                break;
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_REDIRECT:
                isNotNull(onStepActionRedirect) && onStepActionRedirect();
                break;
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_INPUT:
                isNotNull(onStepActionInput) && onStepActionInput();
                break;
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_SELECT:
                isNotNull(onStepActionSelect) && onStepActionSelect();
                break;
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_SIDE_INSTRUCTION:
                isNotNull(onStepSideInstruction) && onStepSideInstruction();
                break;
            default:
                alert("Error: Illegal action type")
                console.error("Illegal action type");
                break;
        }
    }
}

async function showTutorialStepManual() {
    chooseFunctionAccordingToCurrentStepType(manualStep, manualStep, manualRedirect, manualInput, manualSelect, manualSideInstruction);
}

//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
//MARK: Walk me through screen actions
//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
function manualStep(showNext = true) {
    const click = tutorialsManager.getCurrentStep().actionObject.defaultClick;
    console.log(click.path)
    //const element = $(jqueryElementStringFromDomPath(click.path)).first();
    if (click.useAnythingInTable) {
        highlightAndScollTo(click.table);
    } else {
        highlightAndScollTo(click.path);
    }
}

function onPopUpNextStepButtonClicked() {
    const currentStep = tutorialsManager.getCurrentStep();
    if (currentStep.actionType === VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK) {
        const step = currentStep.actionObject.defaultClick;
        const element = $(jqueryElementStringFromDomPath(step.path))[0];
        simulateClick(element);
    }

}

function manualRedirect(showNext = true) {
    const click = tutorialsManager.getCurrentStep().actionObject.defaultClick;
    if (click.useAnythingInTable) {
        highlightAndScollTo(click.table);
    } else {
        highlightAndScollTo(click.path);
    }
}

function manualInput(showNext = true) {
    const inputObj = tutorialsManager.getCurrentStep().actionObject;
    //const element = $(jqueryElementStringFromDomPath(inputObj.path)).first();
    highlightAndScollTo(inputObj.path);
}

function manualSelect(showNext = true) {
    const click = tutorialsManager.getCurrentStep().actionObject.defaultClick;
}

function manualSideInstruction(showNext = true) {
    const sideInstructionObj = tutorialsManager.getCurrentStep().actionObject;
    highlightAndScollTo(sideInstructionObj.path);
    //UI
    globalCache.sideInstructionAutoNextTimer = setTimeout(() => {
        incrementCurrentStepHelper(showNext, false);
    }, 3000);
}

function updateStepInstructionUIHelper() {
    if (isEmpty(tutorialsManager.getCurrentStep().name)) {
        tutorialsManager.getCurrentStep().name = `Step ${tutorialsManager.getCurrentStep().index}`;
    }
    if (isEmpty(tutorialsManager.getCurrentStep().description)) {
        tutorialsManager.getCurrentStep().description = `Select the highlighted box`;
    }
    popUpStepName.html(tutorialsManager.getCurrentStep().name);
    popUpStepDescription.html(tutorialsManager.getCurrentStep().description);
}

//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
//MARK: Automating tutorial functions
//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
async function showTutorialStepAuto() {
    chooseFunctionAccordingToCurrentStepType(autoClick, autoClick, autoRedirect, autoInput, autoSelect, autoSideInstruction)
}

function autoClick(showNext = true) {
    const step = tutorialsManager.getCurrentStep().actionObject.defaultClick;
    if (step.useAnythingInTable || tutorialsManager.getCurrentStep().automationInterrupt) {
        //stop automation
        globalCache.globalEventsHandler.setIsAutomationInterrupt(true);
        manualStep(showNext);
        return;
    }
    const element = $(jqueryElementStringFromDomPath(step.path))[0];
    if (globalCache.isAutomatingNextStep) {
        simulateClick(element);
        incrementCurrentStepHelper(showNext, false);
        globalCache.isAutomatingNextStep = false;
    } else {
        highlightAndScollTo(step.path, () => {
            simulateClick(element);
            incrementCurrentStepHelper(showNext);
        });
    }
}


function autoRedirect() {
    const url = tutorialsManager.getCurrentStep().actionObject.url;
    tutorialsManager.getCurrentTutorial().currentStep += 1;
    location.replace(url);
}

function autoInput() {
    const step = tutorialsManager.getCurrentStep().actionObject;
    //get and highlight input element
    const inputEle = $(jqueryElementStringFromDomPath(step.path)).first();

    highlightAndScollTo(step.path, () => {
        //check if there is default input
        const defaultText = step.defaultText;
        // if (isNotNull(defaultText) && !isEmpty(defaultText)) {
        //     //fill input with default
        //     inputEle.val(defaultText);
        //     incrementCurrentStepHelper(tutorialObj);
        // } else {
        //     //asks for input

        // }        
        globalCache.globalEventsHandler.setIsAutomationInterrupt(true);
        return;
    });
}

function autoSelect() {
    const step = tutorialsManager.getCurrentStep().actionObject;
    //get and highlight input element
    const selectEle = $(jqueryElementStringFromDomPath(step.path)).first();
    highlightAndScollTo(step.path, () => {
        //check if there is default input
        selectEle.val(step.defaultValue);
        //this step completed, go to next step
        incrementCurrentStepHelper();
    });
}

function autoSideInstruction() {
    incrementCurrentStepHelper();
}

function incrementCurrentStepHelper(showNext = true, auto = true) {
    globalCache.globalEventsHandler.setIsAutomationInterrupt(false);
    tutorialsManager.onFollowingNextStep();
    const realAuto = auto && (globalCache.globalEventsHandler.tutorialStatusCache === VALUES.TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL)
    if (realAuto) {
        showNext && showTutorialStepAuto();
    } else if (auto) {
        showNext && showTutorialStepManual();
    } else {
        showNext && showTutorialStepManual();
    }
}

function onAutomationSpeedSliderChanged() {
    globalCache.speedBarValue = automationSpeedSlider.val();
}

//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
//MARK: Handling click when walking through tutorial
//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
function onClickWhenFollowingTutorial() {
    //TODO: add regexp and handle user mistakes
    console.log('onClickWhenFollowingTutorial');
    chooseFunctionAccordingToCurrentStepType(onClickWithStepTypeClick, onClickWithStepTypeClick, onClickWithStepTypeRedirect, onClickWithStepTypeInput, null, onClickWithStepTypeSideInstruction);
    function onClickWithStepTypeClick(showNext = true) {
        const click = tutorialsManager.getCurrentStep().actionObject.defaultClick;
        if (click.useAnythingInTable) {
            const tablePath = click.table;
            if (isSubArray(globalCache.domPath, tablePath)) {
                incrementCurrentStepHelper(true, false);
            } else {
                onClickedOnWrongElement(tablePath);
            }
        } else {
            const clickPath = click.path;
            console.log('should click' + clickPath)
            if (isSubArray(globalCache.domPath, clickPath)) {
                incrementCurrentStepHelper(true, false);
                return;
            } else {
                onClickedOnWrongElement(clickPath);
            }
        }
    }

    function onClickWithStepTypeInput(showNext = true) {
        const inputPath = tutorialsManager.getCurrentStep().actionObject.path;
        if (isSubArray(globalCache.domPath, inputPath)) {
            //TODO: record input and go to next step only when inputted one char
            incrementCurrentStepHelper(showNext, false);
            return;
        } else {
            onClickedOnWrongElement(inputPath);
        }
    }

    function onClickWithStepTypeRedirect(showNext = true) {

    }

    function onClickWithStepTypeSideInstruction(showNext = true) {
        const elementPath = tutorialsManager.getCurrentStep().actionObject.path;
        if (isSubArray(globalCache.domPath, elementPath)) {
            clearTimeout(globalCache.sideInstructionAutoNextTimer);
            globalCache.sideInstructionAutoNextTimer = null;
            incrementCurrentStepHelper(showNext, false);
            return;
        } else {
            onClickedOnWrongElement(elementPath);
        }
    }

    function onClickedOnWrongElement(path) {
        //simulateClick(globalCache.currentElement);
        highlightAndScollTo(path);
    }
}