async function onStopTutorialButtonClicked() {
    //clear stuff
    clearUIOnNextStep();

    startTutorialButtonClicked = false;

    //UI
    $('.w-following-tutorial-item, .w-follow-tutorial-options-item, .w-highlight-instruction-window').hide();

    const data = {};
    data[VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS] = VALUES.FOLLOWING_TUTORIAL_STATUS.NOT_FOLLOWING_TUTORIAL;
    data[VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID] = null;
    data[VALUES.STORAGE.REVISIT_PAGE_COUNT] = 0;
    syncStorageSetBatch(data);

    globalCache = new GlobalCache();

    fetchSimpleTutorials();
}

function prepareTutorialIfIsFollowing(recordingStatus, afterPrepare) {
    mainPopUpContainer.show();
    //check if on right page
    chrome.storage.sync.get([VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID], result => {
        const tutorialObj = result[VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID];
        const currentStep = tutorialObj.steps[tutorialObj.currentStep];

        globalCache.tutorialObj = tutorialObj;
        globalCache.currentStep = currentStep;

        if (checkIfUrlMatch(currentStep.url, currentUrl)) {
            $('.w-following-tutorial-item').show();

            globalCache.globalEventsHandler.setFollwingTutorialStatusCache(recordingStatus);

            afterPrepare();
        } else {
            globalCache.globalEventsHandler.setIsOnRightPage(false);
            mainPopUpContainer.children().hide();
            mainDraggableArea.show();
            popUpHeader.show();
            $('.w-wrong-page-item').show();
            stopOptionsStopButton.show();
            wrongPageRedirectButton.html(`<p>You have an ongoing tutorial at</p> ${currentStep.url}`);
            wrongPageRedirectButton.attr('href', currentStep.url);
        }
    });
}

async function checkFollowingTutorialStatus() {
    chrome.storage.sync.get(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, (result) => {
        const recordingStatus = result[VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS];
        globalCache.globalEventsHandler.setFollwingTutorialStatusCache(recordingStatus);
        switch (result[VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS]) {
            case VALUES.FOLLOWING_TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL:
                prepareTutorialIfIsFollowing(recordingStatus, showTutorialStepManual);
                break;
            case VALUES.FOLLOWING_TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL:
                prepareTutorialIfIsFollowing(recordingStatus, showTutorialStepAuto);
                break;
            case VALUES.FOLLOWING_TUTORIAL_STATUS.NOT_FOLLOWING_TUTORIAL:
                onStopTutorialButtonClicked();
                break;
            default:
                onStopTutorialButtonClicked();
                break;
        }
    })
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

async function callFunctionOnSwitchStepType(onStepActionClick, onStepActionClickRedirect, onStepActionRedirect, onStepActionInput, onStepActionSelect, onStepSideInstruction) {
    chrome.storage.sync.get([VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, VALUES.STORAGE.AUTOMATION_SPEED], result => {
        const tutorialObj = result[VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID];
        const currentStep = tutorialObj.steps[tutorialObj.currentStep];
        const interval = intervalFromSpeed(result[VALUES.STORAGE.AUTOMATION_SPEED]);

        globalCache.tutorialObj = tutorialObj;
        globalCache.currentStep = currentStep;
        globalCache.interval = interval;

        if (tutorialObj.currentStep >= tutorialObj.steps.length) {
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
    })
}

async function showTutorialStepManual() {
    callFunctionOnSwitchStepType(manualStep, manualStep, manualRedirect, manualInput, manualSelect, manualSideInstruction);
}

//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
//MARK: Walk me through screen actions
//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
function manualStep(showNext = true) {
    const click = globalCache.currentStep.actionObject.defaultClick;
    //const element = $(jqueryElementStringFromDomPath(click.path)).first();
    if (click.useAnythingInTable) {
        highlightAndScollTo(click.table);
    } else {
        highlightAndScollTo(click.path);
    }
}

function manualRedirect(showNext = true) {
    const click = globalCache.currentStep.actionObject.defaultClick;
    if (click.useAnythingInTable) {
        highlightAndScollTo(click.table);
    } else {
        highlightAndScollTo(click.path);
    }
}

function manualInput(showNext = true) {
    const inputObj = globalCache.currentStep.actionObject;
    //const element = $(jqueryElementStringFromDomPath(inputObj.path)).first();
    highlightAndScollTo(inputObj.path);
}

function manualSelect(showNext = true) {
    const click = globalCache.currentStep.actionObject.defaultClick;
}

function manualSideInstruction(showNext = true) {
    const sideInstructionObj = globalCache.currentStep.actionObject;
    highlightAndScollTo(sideInstructionObj.path);
    //UI
    globalCache.sideInstructionAutoNextTimer = setTimeout(() => {
        incrementCurrentStepHelper(showNext, false);
    }, 3000);
}

function updateStepInstructionUIHelper() {
    if (isEmpty(globalCache.currentStep.name)) {
        globalCache.currentStep.name = `Step ${globalCache.currentStep.index}`;
    }
    if (isEmpty(globalCache.currentStep.description)) {
        globalCache.currentStep.description = `Select the highlighted box`;
    }
    popUpStepName.html(globalCache.currentStep.name);
    popUpStepDescription.html(globalCache.currentStep.description);
}

//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
//MARK: Automating tutorial functions
//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
async function showTutorialStepAuto() {
    callFunctionOnSwitchStepType(autoClick, autoClick, autoRedirect, autoInput, autoSelect, autoSideInstruction)
}

function autoClick(showNext = true) {
    const step = globalCache.currentStep.actionObject.defaultClick;
    if (step.useAnythingInTable || globalCache.currentStep.automationInterrupt) {
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
    const url = globalCache.currentStep.actionObject.url;
    globalCache.tutorialObj.currentStep += 1;
    syncStorageSet(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, globalCache.tutorialObj, () => {
        location.replace(url);
    });
}

function autoInput() {
    const step = globalCache.currentStep.actionObject;
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
    const step = globalCache.currentStep.actionObject;
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
    globalCache.tutorialObj.currentStep += 1;
    syncStorageSet(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, globalCache.tutorialObj, () => {
        const realAuto = auto && (globalCache.globalEventsHandler.followingTutorialStatusCache === VALUES.FOLLOWING_TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL)
        if (realAuto) {
            showNext && showTutorialStepAuto();
        } else if (auto) {
            showNext && showTutorialStepManual();
        } else {
            globalCache.isSimulatingClick = false;
            showNext && showTutorialStepManual();
        }
    });
}

function onAutomationSpeedSliderChanged() {
    syncStorageSet(VALUES.STORAGE.AUTOMATION_SPEED, automationSpeedSlider.val());
}

//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
//MARK: Handling click when walking through tutorial
//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
function onClickWhenFollowingTutorial() {
    //TODO: add regexp and handle user mistakes
    console.log('onClickWhenFollowingTutorial');
    callFunctionOnSwitchStepType(onClickWithStepTypeClick, onClickWithStepTypeClick, onClickWithStepTypeRedirect, onClickWithStepTypeInput, null, onClickWithStepTypeSideInstruction);
    function onClickWithStepTypeClick(showNext = true) {
        const click = globalCache.currentStep.actionObject.defaultClick;
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
        const inputPath = globalCache.currentStep.actionObject.path;
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
        const elementPath = globalCache.currentStep.actionObject.path;
        if (isSubArray(globalCache.domPath, elementPath)) {
            clearTimeout(globalCache.sideInstructionAutoNextTimer);
            globalCache.sideInstructionAutoNextTimer = null;
            incrementCurrentStepHelper(showNext, false);
            return;
        } else {
            onClickedOnWrongElement(inputPath);
        }
    }

    function onClickedOnWrongElement(path) {
        //simulateClick(globalCache.currentElement);
        highlightAndScollTo(path);
    }
}