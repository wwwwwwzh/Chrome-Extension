// Initialize Firebase
var app = initializeApp(firebaseConfig);
// initializeFirestore(app, { useFetchStreams: false });
// const analytics = getAnalytics(app);
var firestoreRef = getFirestore(app);

//cache
var currentUrl;
var currentUrlObj;
var globalCache = new GlobalCache();

//set up functions
async function setUp() {
    currentUrl = $(location).attr('href');
    syncStorageSet(VALUES.STORAGE.CURRENT_URL, currentUrl);
    currentUrlObj = new URL(currentUrl);

    chrome.storage.sync.get(VALUES.STORAGE.IS_RECORDING_ACTIONS, result => {
        const isRecording = result[VALUES.STORAGE.IS_RECORDING_ACTIONS];
        globalCache.globalEventsHandler.setIsRecordingCache(isRecording);
        if (!isRecording) {
            checkFollowingTutorialStatus();
        }
    })
    //setUpIframeListner();

}

$(() => {
    setUp();
})

function setUpIframeListner() {
    getFrameContents();
    function getFrameContents() {
        const iFrame = document.getElementsByTagName('iframe')[0];
        if (isNotNull(iFrame)) {
            return;
        }
        if (isNotNull(iFrame.contentDocument)) {
            setTimeout(() => {
                getFrameContents();
            }, 1000);
            return;
        }
        let iFrameBody = iFrame.contentDocument.getElementsByTagName('body')[0];

        let iFrameBodyJQ = $(iFrameBody);
        iFrameBodyJQ.on('click', async (event) => {
            onClickUniversalHandler(event);
        })
    }
}

//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
//MARK: Start of giving suggestions
//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
function automationSpeedSliderHelper() {
    chrome.storage.sync.get(VALUES.STORAGE.AUTOMATION_SPEED, result => {
        automationSpeedSlider.val(result[VALUES.STORAGE.AUTOMATION_SPEED]);
    })
}

async function fetchSimpleTutorials() {
    $('.w-not-following-tutorial-item').remove();
    automationSpeedSliderHelper();
    const domainName = "https://" + currentUrlObj.hostname + "/";
    const url_matches = [currentUrl, domainName];
    const simpleTutorialQuery = query(collection(firestoreRef,
        VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL),
        where(
            VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL_ALL_URLS,
            VALUES.FIRESTORE_QUERY_TYPES.ARRAY_CONTAINS_ANY,
            url_matches
        ));

    const simpleTutorialQuerySnapshot = await getDocs(simpleTutorialQuery);

    if (!simpleTutorialQuerySnapshot.empty) {
        mainPopUpContainer.show();
        //iterate query to add tutorial buttons
        simpleTutorialQuerySnapshot.forEach((tutorial) => {
            mainPopUpContainer.append(`
            <a class=\"w-simple-tutorial-button w-not-following-tutorial-item w-button-normal\" id=\"${tutorial.id}\">
                ${tutorial.data().name}
            </a>
            `);
            const button = $(`#${tutorial.id}`).first();

            //button click function. store tutorial's steps to storage
            button.on('click', () => {
                onFollowTutorialButtonClicked(tutorial);
            });
        });
    } else {
        mainPopUpContainer.hide();
    }
};

function showFollowingTutorialItems() {
    $('.w-follow-tutorial-options-item').hide();
    $('.w-following-tutorial-item').show();

    popUpStepName.html('');
    popUpStepDescription.html('');
}


async function onFollowTutorialButtonClicked(tutorial) {
    //toogle html elements
    globalCache.reHighlightAttempt = 0;
    $('.w-follow-tutorial-options-item').show();
    $('.w-not-following-tutorial-item').remove();
    popUpNextStepButton.hide();

    automationSpeedSliderHelper();

    popUpAutomateButton.on('click', () => {
        onPopUpAutomateButtonClicked(tutorial);
    })

    popUpManualButton.on('click', () => {
        onPopUpManualButtonClicked(tutorial);
    })
}

async function onPopUpAutomateButtonClicked(tutorial) {
    if (globalCache.tutorialObj !== null) {
        return;
    }
    loadTutorialToStorage(tutorial).then(() => {
        syncStorageSet(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, VALUES.FOLLOWING_TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL);
        globalCache.globalEventsHandler.setFollwingTutorialStatusCache(VALUES.FOLLOWING_TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL);
        showTutorialStepAuto();
        showFollowingTutorialItems();
    })
}

async function onPopUpManualButtonClicked(tutorial) {
    if (globalCache.tutorialObj !== null) {
        return;
    }
    loadTutorialToStorage(tutorial).then(() => {
        syncStorageSet(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, VALUES.FOLLOWING_TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL);
        globalCache.globalEventsHandler.setFollwingTutorialStatusCache(VALUES.FOLLOWING_TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL);
        showTutorialStepManual();
        showFollowingTutorialItems();
    })
}

async function loadTutorialToStorage(tutorial) {
    syncStorageSet(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_ID, tutorial.id);
    //get all information about the tutorial from firebase
    const stepsQuery = query(collection(firestoreRef,
        VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL,
        tutorial.id,
        VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL_STEPS
    ), orderBy(VALUES.FIRESTORE_CONSTANTS.STEP_INDEX));
    const stepsQuerySnapshot = await getDocs(stepsQuery);
    //construct steps array from query
    var steps = [];
    //TODO!: solve url problem (possibly using regex)
    var isFirstStepReached = false;
    stepsQuerySnapshot.forEach((step) => {
        const data = step.data();
        //remove steps used prior to accessing this page
        if (isFirstStepReached) {
            steps.push(data);
        } else {
            // if (url[0] === '/') {
            //     //regex
            //     const regex = new RegExp(url.substr(1, url.length - 2));
            //     if (regex.test(currentUrl)) {
            //         isFirstStepReached = true;
            //         steps.push(data);
            //     }
            // } else {
            //     if (url === currentUrl) {
            //         isFirstStepReached = true;
            //         steps.push(data);
            //     }
            // }
            if (checkIfUrlMatch(data.url, currentUrl)) {
                isFirstStepReached = true;
                steps.push(data);
            }
        }
    })

    //construct tutorial object
    const tutorialObj = new SimpleTutorial(steps)
    syncStorageSet(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, tutorialObj);
    globalCache.tutorialObj = tutorialObj;
}

function clearUIOnNextStep() {
    removeLastHighlight();
}

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

/**
 * Stimulate any type of click using javascript's dispatch event. Covers cases where jquery.click() or 
 * .trigger('click') don't work
 * @param {HTML Element} element 
 */
function simulateClick(element, eventType = 'click') {
    if (isNotNull(element)) {
        console.log(`simulating click on ${element}`)
        globalCache.isSimulatingClick = true;
        const evt = new MouseEvent(eventType, {
            view: window,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(evt);
    } else {
        console.log('simulateClick: element not found')
    }
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
//MARK: Start of recording events
//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
function addGlobalEventListenersWhenRecording() {
    $('*').on('blur focus focusin focusout load resize scroll unload dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error',
        preventDefaultHelper);
    $('*').on('click', onClickHelper);
}

function removeGlobalEventListenersWhenRecording() {
    $('*').off('blur focus focusin focusout load resize scroll unload dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error',
        preventDefaultHelper);
    $('*').off('click', onClickHelper);
}

function addGlobalEventListenersWhenFollowing() {
    $('*').on('click', onClickHelper);
}

function removeGlobalEventListenersWhenFollowing() {
    $('*').off('click', onClickHelper);
}

/**blur focus focusin focusout load resize scroll unload dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error
*/

function onClickHelper(event) {
    preventDefaultHelper(event);
    if (event.target !== globalCache.currentElement) {
        console.log(globalCache.isSimulatingClick)
        if (!globalCache.isSimulatingClick) {
            processEventHelper(event.target);
        }
        globalCache.isSimulatingClick = false;
    }
}

function processEventHelper(target) {
    globalCache.domPath = getShortDomPathStack(target);
    if ($(jqueryElementStringFromDomPath(globalCache.domPath)).length > 1) {
        globalCache.domPath = getCompleteDomPathStack(target);
    }
    console.log(`clicking: ${globalCache.domPath}`);
    globalCache.currentElement = target;
    onClickUniversalHandler();
}

function preventDefaultHelper(event) {
    if (!globalCache.isSimulatingClick && globalCache.globalEventsHandler.isLisentingRecording) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false
    }
}

async function onClickUniversalHandler() {
    if (globalCache.globalEventsHandler.isLisentingRecording) {
        onClickWhenRecording();
    } else if (globalCache.globalEventsHandler.isLisentingFollowing) {
        switch (globalCache.globalEventsHandler.followingTutorialStatusCache) {
            case VALUES.FOLLOWING_TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL:
                onClickWhenFollowingTutorial();
                break;
            default:
                break;
        }
    }
    if (globalCache.globalEventsHandler.isAutomationInterrupt) {
        onClickWhenFollowingTutorial();
    }
}

async function onClickWhenRecording() {
    //get element
    const jQElement = $(globalCache.currentElement);

    syncStorageSet(VALUES.STORAGE.CURRENT_SELECTED_ELEMENT, globalCache.domPath);

    //get table if it exists for tutorial
    const nearestTable = getNearestTableOrList(jQElement[0]);
    if (!isNotNull(nearestTable)) {
        syncStorageSet(VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE, null);
    } else {
        var nearestTablePath = getShortDomPathStack(nearestTable)
        if ($(jqueryElementStringFromDomPath(nearestTablePath)).length > 1) {
            nearestTablePath = getCompleteDomPathStack(nearestTable);
        }
        syncStorageSet(VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE, nearestTablePath);
    }
    //Highlight
    if (jQElement.is('a')) {
        highlightAndRemoveLastHighlight(jQElement.parent());
    } else {
        highlightAndRemoveLastHighlight(jQElement);
    }
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

//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
//MARK: highlight functions
//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
function highlightAndScollTo(path, callback = () => { }) {
    const jQElement = $(jqueryElementStringFromDomPath(path));
    const htmlElement = jQElement[0];

    //TODO: bug
    if (isNotNull(jQElement.attr("class")) && arrayContains(jQElement.attr("class").split(/\s+/), ['w-highlight-box', 'w-highlight-box-specifier'])) {
        return;
    }

    if (highlightAndRemoveLastHighlight(jQElement, path, callback)) {
        //Scroll
        globalCache.currentJQScrollingParent = $(getScrollParent(htmlElement, false));
        var offset = 0;
        const eleOffset = jQElement.offset();
        const scrollParentOffset = globalCache.currentJQScrollingParent.offset();
        if (isNotNull(eleOffset) && isNotNull(scrollParentOffset)) {
            offset = parseInt(eleOffset.top) - parseInt(scrollParentOffset.top) - window.innerHeight / 2
        }
        globalCache.currentJQScrollingParent.animate({
            scrollTop: `+=${offset}px`
        }, globalCache.interval).promise().then(() => {
            callback();
        })
    }
}

function clearReHighlightTimer() {
    isNotNull(globalCache.reHighlightTimer) && clearTimeout(globalCache.reHighlightTimer);
    globalCache.reHighlightTimer = null;
}

function highlightAndRemoveLastHighlight(jQElement, path = null, callback = null) {
    //if path is null, calling from recording highlight
    if (path !== null) {
        //Repeat if element not found, might not be handled here
        if (!isNotNull(jQElement[0])) {
            if (globalCache.reHighlightAttempt > 5) {
                //stop refinding element
                console.error("ELEMENT NOT FOUND");
                globalCache.reHighlightTimer = null;
                //onStopTutorialButtonClicked();
                highlightInstructionWindow.hide();
                return false;
            }
            globalCache.reHighlightAttempt++;
            setTimeout(() => {
                globalCache.reHighlightTimer = highlightAndScollTo(path, callback);
            }, 300);
            return false;
        }
        globalCache.reHighlightAttempt = 0;
        clearReHighlightTimer();
        console.trace();
        updateHighlightInstructionWindow(jQElement);
        highlightAndRemoveLastHighlightHelper();
        return true;
    } else {
        highlightAndRemoveLastHighlightHelper();
        return false
    }

    function highlightAndRemoveLastHighlightHelper() {
        removeLastHighlight();
        jQElement.addClass('w-highlight-box w-highlight-box-specifier');
        alertElement(jQElement);

        function alertElement(element) {
            var perAnimationBorderLoopCount = 0;

            borderOut();

            globalCache.alertElementInterval = setInterval(() => {
                element.stop();
                element.removeAttr('style');
                borderOut();
            }, 3500);

            function borderOut() {
                element.animate({
                    boxShadow: '0px 0px 3px 6px rgba(255, 60, 43, 1)',
                }, 300).promise().then(() => {
                    borderIn();
                });
            }

            function borderIn() {
                element.animate({
                    boxShadow: '0px 0px 3px 6px rgba(255, 200, 42, 1)',
                }, 300).promise().then(() => {
                    if (perAnimationBorderLoopCount++ < 2) {
                        borderOut();
                    } else {
                        element.stop();
                        element.removeAttr('style');
                        perAnimationBorderLoopCount = 0;
                    }
                });
            }
        }
    }
}

function removeLastHighlight() {
    //stop timers and animations
    clearReHighlightTimer()
    isNotNull(globalCache.currentJQScrollingParent) && globalCache.currentJQScrollingParent.stop();
    globalCache.currentJQScrollingParent = null;
    clearInterval(globalCache.alertElementInterval);
    globalCache.alertElementInterval = null;

    const highlightedElements = $('.w-highlight-box.w-highlight-box-specifier');
    highlightedElements.stop(true);
    highlightedElements.removeAttr('style');
    highlightedElements.removeClass('w-highlight-box w-highlight-box-specifier');
}



var updateCount = 0;
function updateHighlightInstructionWindow(element) {
    const stepName = globalCache.currentStep.name;
    const stepDescription = globalCache.currentStep.description;

    if (isNotNull(stepName) || isNotNull(stepDescription)) {
        highlightInstructionWindow.show();
        const layout = getInstructionWindowLayout(element);
        //console.log(layout);
        highlightInstructionWindow.css(layout.css);
        movePopupIfOverlap();
        updateStepInstructionUIHelper();
        if (updateCount === 0) {
            setTimeout(() => {
                updateHighlightInstructionWindow(element);
            }, 200);
            updateCount++;
        } else {
            updateCount = 0;
        }
    } else {

    }
}

//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
//MARK: recording menu
//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
async function onNewTutorialNameButtonClicked() {
    if (newTutorialNameInput.val().length > 1) {
        var data = {};
        data[VALUES.STORAGE.CURRENT_RECORDING_TUTORIAL_NAME] = newTutorialNameInput.val();
        data[VALUES.RECORDING_STATUS.STATUS] = VALUES.RECORDING_STATUS.BEGAN_RECORDING;
        data[VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_STEP_INDEX] = 0;
        data[VALUES.STORAGE.CURRENT_STEP_OBJ] = null;
        data[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT] = null;
        data[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE] = null;
        syncStorageSetBatch(data);
        newTutorialNameInput.val('');
        showStepContainer();
    }
}

//MARK: Set up menu if needed
function showStepContainer() {
    newTutorialContainer.hide();
    stepDetailsContainer.show();
}

function showNewRecordingContainer() {
    stepDetailsContainer.hide();
    newTutorialContainer.show();
}


var currentStepObj = null;

// chrome.storage.sync.get([VALUES.RECORDING_STATUS.STATUS, VALUES.STORAGE.IS_RECORDING_ACTIONS, VALUES.STORAGE.CURRENT_STEP_OBJ, VALUES.STORAGE.CURRENT_SELECTED_ELEMENT, VALUES.STORAGE.CURRENT_URL], (result) => {
//     switch (result[VALUES.RECORDING_STATUS.STATUS]) {
//         case VALUES.RECORDING_STATUS.RECORDING: case VALUES.RECORDING_STATUS.BEGAN_RECORDING:
//             recordTutorialSwitch.prop('checked', result[VALUES.STORAGE.IS_RECORDING_ACTIONS]);
//             //TODO: get h3 element
//             $('h3').html(result[VALUES.STORAGE.IS_RECORDING_ACTIONS] ? "Recording" : "Not Recording");
//             currentStepObj = result[VALUES.STORAGE.CURRENT_STEP_OBJ];
//             loadMenuFromStorage(currentStepObj);

//             const selectedElementPath = result[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT];
//             if (isNotNull(selectedElementPath)) {
//                 selectedElementIndicator.html(`Selected Element: ${selectedElementPath.slice(max(selectedElementPath.length - 2, 0), selectedElementPath.length)}`)
//             } else {
//                 selectedElementIndicator.html('Selected Element: None')
//             }
//             if (isNotNull(result[VALUES.STORAGE.CURRENT_URL])) {
//                 customStepUrlInput.val(result[VALUES.STORAGE.CURRENT_URL]);
//             }

//             showStepContainer();
//             break;
//         case VALUES.RECORDING_STATUS.NOT_RECORDING:
//             syncStorageSet(VALUES.STORAGE.IS_RECORDING_ACTIONS, false);
//             sendMessageToContentScript({ isRecordingStatus: false });
//             showNewRecordingContainer();
//             break;
//         default:
//             onStopNewTutorialRecording()
//             showNewRecordingContainer();
//             break;
//     };
// });

function loadMenuFromStorage(currentStepObj) {
    if (isNotNull(currentStepObj)) {
        switchMenu(currentStepObj.actionType);
        selectActionTypeSelect.val(currentStepObj.actionType);
        if (isNotNull(currentStepObj.url)) {
            useCustomStepUrlCheckbox.prop('checked', true);
            customStepUrlContainer.show();
            customStepUrlInput.val(currentStepObj.url);
        }
    } else {
        switchMenu(VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL);
        selectActionTypeSelect.val(VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL);
    }
}

//MARK: Helper functions to retrieve and update step object 
function storeCurrentStep() {
    syncStorageSet(VALUES.STORAGE.CURRENT_STEP_OBJ, currentStepObj);
}

function prepareCurrentStep(callback = () => { }) {
    //check if step exists
    if (!isNotNull(currentStepObj)) {
        const indexKey = VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_STEP_INDEX;
        chrome.storage.sync.get([indexKey], result => {
            currentStepObj = new Step(result[indexKey], VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL, new NullAction(), "", "");
            callback();
        })
    } else {
        callback();
    }
}

function updateCurrentStep(update) {
    prepareCurrentStep(() => {
        update();
        storeCurrentStep();
    });
}



function callFunctionOnActionType(actionType, clickFunc, carFunc, inputFunc, redirectFunc, selectFunc, instructionFunc, nullFunc = null, defaultFunc = null) {
    switch (actionType) {
        case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL:
            (nullFunc !== null) && nullFunc();
            break;
        case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK:
            (clickFunc !== null) && clickFunc();
            break;
        case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK_REDIRECT:
            (carFunc !== null) && carFunc();
            break;
        case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_INPUT:
            (inputFunc !== null) && inputFunc();
            break;
        case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_REDIRECT:
            (redirectFunc !== null) && redirectFunc();
            break;
        case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_SELECT:
            (selectFunc !== null) && selectFunc();
            break;
        case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_SIDE_INSTRUCTION:
            (instructionFunc !== null) && instructionFunc();
            break;
        default:
            (defaultFunc !== null) && defaultFunc();
            break;
    }
}

function switchMenu(selection) {
    callFunctionOnActionType(selection, showClickMenu, showClickAndRedirectMenu, showInputMenu, showRedirectMenu, showSelectMenu, showSideInstructionMenu, showNullMenu);
    updateCurrentStep(() => {
        if (currentStepObj.actionType !== selection) {
            currentStepObj.actionType = selection;
            callFunctionOnActionType(
                selection,
                () => {
                    currentStepObj.actionObject = new ClickAction(new ClickGuide([], null, null, false, null, false, null), []);
                }, () => {
                    currentStepObj.actionObject = new ClickAction(new ClickGuide([], null, null, true, null, false, null), []);
                }, () => {
                    currentStepObj.actionObject = new InputAction([], "", [], false, VALUES.INPUT_TYPES.TEXT);
                }, () => {
                    currentStepObj.actionObject = new RedirectAction(null);
                }, () => {
                    currentStepObj.actionObject = new SelectAction([], null, false);
                }, () => {
                    currentStepObj.actionObject = new SideInstructionAction([]);
                }, () => {
                    currentStepObj.actionObject = new NullAction();
                });

        }
        loadMenuItems(selection);
    });
}

function loadMenuItems(selection) {
    stepNameInput.val(currentStepObj.name);
    stepDescriptionInput.val(currentStepObj.description);
    callFunctionOnActionType(
        selection,
        () => {
            //click
            clickActionNameInput.val(currentStepObj.actionObject.defaultClick.name);
            clickActionDescriptionInput.val(currentStepObj.actionObject.defaultClick.description);
        }, () => {
            //car
            urlInput.val(currentStepObj.actionObject.defaultClick.url);
        }, () => {
            //input
            inputActionDefaultInput.val(currentStepObj.actionObject.defaultText)
        }, () => {
            //redirect
            urlInput.val(currentStepObj.actionObject.url);
        }, () => {
            //select
        }, () => {
            //side instruction
        });
}
//------------------------------------------------------------------------------------------------------------
//MARK: Step action menu UI manipulation ------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
function clearCurrentMenu() {
    stepDetailsContainer.children().hide();
    $('.common-action-container').show();
    selectedElementIndicatorContainer.show();
}

function showNullMenu() {
    stepDetailsContainer.children().hide();
    $('.common-action-container').show();
}

function showClickMenu() {
    clearCurrentMenu();
    $('.customizable-action-container').show();
    $('.click-action-container').show();
    addAlternativeActionButton.html('Add Alternative Click');

    chrome.storage.sync.get(VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE, result => {
        const table = result[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE];
        if (!isNotNull(table)) {
        } else {
            useAnyElementInTableInput.val(table)
        }
    })
}

function showInputMenu() {
    clearCurrentMenu();
    $('.input-action-container').show();
    $('.customizable-action-container').show();
    addAlternativeActionButton.html('Add Alternative Input');
}

function showClickAndRedirectMenu() {
    clearCurrentMenu();
    urlInputContainer.show();
}

function showRedirectMenu() {
    clearCurrentMenu();
    selectedElementIndicatorContainer.hide();
    urlInputContainer.show();
}

function showSelectMenu() {
    clearCurrentMenu();
}

function showSideInstructionMenu() {
    clearCurrentMenu();
}



function endRecordingHelper() {
    var data = {};
    data[VALUES.RECORDING_STATUS.STATUS] = VALUES.RECORDING_STATUS.NOT_RECORDING;
    data[VALUES.STORAGE.IS_RECORDING_ACTIONS] = false;
    data[VALUES.STORAGE.CURRENT_RECORDING_TUTORIAL_NAME] = null;
    data[VALUES.STORAGE.CURRENT_STEP_OBJ] = null;
    data[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT] = null;
    data[VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE] = null;
    data[VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID] = null;
    data[VALUES.STORAGE.STEP_ACTION_TYPE] = VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL;
    sendMessageToContentScript({ isRecordingStatus: false });
    syncStorageSetBatch(data);
    showNewRecordingContainer();

}
//------------------------------------------------------------------------------------------------------------
//MARK: Firebase actions------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
async function deleteDocIfExists() {
    chrome.storage.sync.get(VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID, async (result) => {
        const docId = result[VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID];
        if (isNotNull(docId)) {
            const tutorialRef = doc(firestoreRef, VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL, docId);
            await deleteDoc(tutorialRef);
        }
    })
}

async function addStepToFirebase(stepObj) {
    chrome.storage.sync.get(VALUES.RECORDING_STATUS.STATUS, async (result) => {
        switch (result[VALUES.RECORDING_STATUS.STATUS]) {
            case VALUES.RECORDING_STATUS.BEGAN_RECORDING:
                await postDocToFirebase(
                    stepObj,
                    VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL,
                    VALUES.RECORDING_STATUS.BEGAN_RECORDING
                ).then(() => {
                    syncStorageSet(VALUES.RECORDING_STATUS.STATUS, VALUES.RECORDING_STATUS.RECORDING);
                })
                break;
            case VALUES.RECORDING_STATUS.RECORDING:
                await postDocToFirebase(
                    stepObj,
                    VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL,
                    VALUES.RECORDING_STATUS.RECORDING
                );
                break;
            default:
                break;
        };
    });
}

async function postDocToFirebase(stepObj, type, status) {
    var docId;
    var stepIndex = 0;
    try {
        switch (status) {
            case VALUES.RECORDING_STATUS.BEGAN_RECORDING:
                chrome.storage.sync.get([VALUES.STORAGE.CURRENT_RECORDING_TUTORIAL_NAME, VALUES.STORAGE.CURRENT_URL], async result => {
                    const docRef = await addDoc(collection(firestoreRef, type), {
                        name: result[VALUES.STORAGE.CURRENT_RECORDING_TUTORIAL_NAME],
                    });
                    docId = docRef.id;
                    syncStorageSet(VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID, docId);
                    await addTutorialStep(docId, result[VALUES.STORAGE.CURRENT_URL]);
                })

                break;
            case VALUES.RECORDING_STATUS.RECORDING:
                chrome.storage.sync.get([VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID, VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_STEP_INDEX, VALUES.STORAGE.CURRENT_URL], async (result) => {
                    stepIndex = result[VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_STEP_INDEX] + 1;
                    docId = result[VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID];
                    await addTutorialStep(docId, result[VALUES.STORAGE.CURRENT_URL]);
                });
                break;
            default:
                break;
        }
    } catch (e) {
        console.error("Error adding document: ", e);
    }

    async function addTutorialStep(docId, currentUrl) {
        if (isNotNull(docId)) {
            syncStorageSet(VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_STEP_INDEX, stepIndex);
            //doc object
            stepObj.index = stepIndex;
            if (!isNotNull(stepObj.url)) {
                stepObj.url = currentUrl;
            }

            await addDoc(collection(firestoreRef, type, docId, "Steps"), JSON.parse(JSON.stringify(stepObj)));
            const tutorialRef = doc(firestoreRef, type, docId);
            await updateDoc(tutorialRef, {
                all_urls: arrayUnion(currentUrl),
            })
            if (stepObj.actionType === VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_REDIRECT || stepObj.actionType === VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK_REDIRECT) {
                //after posting to firebase, redirect to specified url
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, { redirect: urlInput.val() });
                });
            }
        }
    }
}





//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
//MARK: message handler
//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (isNotNull(request.redirect)) {
            location.replace(request.redirect)
        }
        if (isNotNull(request.isRecordingStatus)) {
            globalCache.globalEventsHandler.setIsRecordingCache(request.isRecordingStatus);
        }
        if (isNotNull(request.clickPath)) {
            simulateClick($(jqueryElementStringFromDomPath(request.clickPath))[0]);
        }
        if (isNotNull(request.removeHighlight) && request.removeHighlight) {
            removeLastHighlight()
        }
        if (isNotNull(request.onActivated) && request.onActivated) {
            setUp();
        }
        if (isNotNull(request.newTutorial) && request.newTutorial) {
            recordingContainer.show();
        }
    }
);

//Clean stuff
window.onbeforeunload = () => {

}