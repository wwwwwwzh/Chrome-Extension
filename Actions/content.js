// Initialize Firebase
var app;
// const analytics = getAnalytics(app);
var firestoreRef;

//CONST
var currentUrl;
var currentUrlObj;

//set up functions
async function setUp() {
    app = initializeApp(firebaseConfig);
    firestoreRef = getFirestore(app);
    currentUrl = $(location).attr('href');
    syncStorageSet(VALUES.STORAGE.CURRENT_URL, currentUrl);
    currentUrlObj = new URL(currentUrl);

    //sendUnsentDomPath();
    checkFollowingTutorialStatus();
    //setUpIframeListner();
}

function setUpIframeListner() {
    getFrameContents();
    function getFrameContents() {
        const iFrame = document.getElementsByTagName('iframe')[0];
        if (typeof iFrame === 'undefined' || iFrame === null) {
            return;
        }
        if (typeof iFrame.contentDocument === 'undefined' || iFrame.contentDocument === null) {
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
$(() => {
    setUp();
})


//MARK: Start of giving suggestions

function automationSpeedSliderHelper(parent = mainPopUpContainer) {
    parent.append(automationSpeedSlider);
    automationSpeedSlider.on('change', () => {
        onAutomationSpeedSliderChanged();
    })
    chrome.storage.sync.get(VALUES.STORAGE.AUTOMATION_SPEED, result => {
        automationSpeedSlider.val(result[VALUES.STORAGE.AUTOMATION_SPEED]);
    })
}

async function fetchSimpleTutorials() {
    mainPopUpContainer.empty();
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
        //create popup window
        if (mainPopUpContainer.is(":hidden")) {
            mainPopUpContainer.show();
            mainPopUpContainer.append(mainDraggableArea);
            makeElementDraggable(mainDraggableArea[0], mainPopUpContainer[0]);
        }
        //iterate query to add tutorial buttons
        simpleTutorialQuerySnapshot.forEach((tutorial) => {

            mainPopUpContainer.append(`<a class=\"simple-tutorial-button\" id=\"${tutorial.id}\">${tutorial.data().name}</a>`);
            const button = $(`#${tutorial.id}`).first();
            button.css(CSS.MAIN_OPTIONS_POPUP_SIMPLE_TUTORIAL_BUTTON);
            //button click function. store tutorial's steps to storage
            button.on('click', () => {
                onFollowTutorialButtonClicked(tutorial);
            });
        });
    }
};


function createAndShowOptionsContainer() {
    mainStopOptionsContainer.show();
    mainStopOptionsContainer.append(optionsDraggableArea);
    makeElementDraggable(optionsDraggableArea[0], mainStopOptionsContainer[0]);
}

function createAndShowMiddlePopupContainer() {
    mainMiddlePopupContainer.show();
    mainMiddlePopupContainer.append(middleDraggableArea);
    makeElementDraggable(middleDraggableArea[0], mainMiddlePopupContainer[0]);
}



async function onFollowTutorialButtonClicked(tutorial) {
    //toogle html elements
    reHighlightAttempt = 0;
    mainPopUpContainer.hide();
    createAndShowOptionsContainer();
    automationSpeedSliderHelper(mainStopOptionsContainer, true);
    createAndShowMiddlePopupContainer();


    popUpAutomateButton.on('click', () => {
        onPopUpAutomateButtonClicked(tutorial);
    })

    popUpManualButton.on('click', () => {
        onPopUpManualButtonClicked(tutorial);
    })
}

async function onPopUpAutomateButtonClicked(tutorial) {
    loadTutorialToStorage(tutorial).then(() => {
        syncStorageSet(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, VALUES.FOLLOWING_TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL);
        globalEventsHandler.setFollwingTutorialStatusCache(VALUES.FOLLOWING_TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL);
        showTutorialStepAuto();
    })
}

async function onPopUpManualButtonClicked(tutorial) {
    loadTutorialToStorage(tutorial).then(() => {
        syncStorageSet(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, VALUES.FOLLOWING_TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL);
        globalEventsHandler.setFollwingTutorialStatusCache(VALUES.FOLLOWING_TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL);
        showTutorialStepManual();
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
            const url = data.url;
            if (url[0] === '/') {
                //regex
                const regex = new RegExp(url.substr(1, url.length - 2));
                if (regex.test(currentUrl)) {
                    isFirstStepReached = true;
                    steps.push(data);
                }
            } else {
                if (url === currentUrl) {
                    isFirstStepReached = true;
                    steps.push(data);
                }
            }
        }
    })

    //construct tutorial object
    const tutorialObj = new SimpleTutorial(steps)
    //object structure: tutorialObj.steps[i].path[i]. store object to storage
    syncStorageSet(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, tutorialObj);

}

async function onStopTutorialButtonClicked() {
    mainStopOptionsContainer.hide();
    mainMiddlePopupContainer.hide();
    syncStorageSet(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, VALUES.FOLLOWING_TUTORIAL_STATUS.NOT_FOLLOWING_TUTORIAL);
    globalEventsHandler.setFollwingTutorialStatusCache(VALUES.FOLLOWING_TUTORIAL_STATUS.NOT_FOLLOWING_TUTORIAL);
    syncStorageSet(VALUES.STORAGE.REVISIT_PAGE_COUNT, 0);
    fetchSimpleTutorials();
    removeLastHighlight();
}



async function checkFollowingTutorialStatus() {
    chrome.storage.sync.get(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, (result) => {
        globalEventsHandler.setFollwingTutorialStatusCache(result[VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS]);
        switch (result[VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS]) {
            case VALUES.FOLLOWING_TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL:
                createAndShowOptionsContainer();
                createAndShowMiddlePopupContainer();
                showTutorialStepManual();
                break;
            case VALUES.FOLLOWING_TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL:
                createAndShowOptionsContainer();
                createAndShowMiddlePopupContainer();
                showTutorialStepAuto();
                break;
            case VALUES.FOLLOWING_TUTORIAL_STATUS.NOT_FOLLOWING_TUTORIAL:
                fetchSimpleTutorials();
                break;
            default:
                fetchSimpleTutorials();
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

async function callFunctionOnSwitchStepType(onStepActionClick, onStepActionClickRedirect, onStepActionRedirect, onStepActionInput, onStepActionSelect) {
    chrome.storage.sync.get([VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, VALUES.STORAGE.AUTOMATION_SPEED], result => {
        const tutorialObj = result[VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID];
        const currentStep = tutorialObj.steps[tutorialObj.currentStep];

        // alert(JSON.stringify(currentStep));
        const interval = intervalFromSpeed(result[VALUES.STORAGE.AUTOMATION_SPEED]);
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
                    onStepActionClick(tutorialObj, currentStep, interval);
                    break;
                case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK_REDIRECT:
                    onStepActionClickRedirect(tutorialObj, currentStep, interval, false);
                    break;
                case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_REDIRECT:
                    onStepActionRedirect(tutorialObj, currentStep, interval);
                    break;
                case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_INPUT:
                    onStepActionInput(tutorialObj, currentStep, interval);
                    break;
                case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_SELECT:
                    onStepActionSelect(tutorialObj, currentStep, interval);
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
    callFunctionOnSwitchStepType(manualStep, manualRedirect, manualStep, manualInput, manualSelect);
}

function manualStep(tutorialObj, currentStep, interval, showNext = true) {
    const click = currentStep.actionObject.defaultClick;
    //const element = $(jqueryElementStringFromDomPath(click.path)).first();
    if (currentStep.actionObject.defaultClick.useAnythingInTable) {
        highlightAndScollTo(click.table, interval);
    } else {
        highlightAndScollTo(click.path, interval);
    }
    //UI
    updateStepInstructionUIHelper(currentStep);
}

function manualRedirect(tutorialObj, currentStep, interval, showNext = true) {
    const click = currentStep.actionObject.defaultClick;
    const element = $(jqueryElementStringFromDomPath(click.path)).first();
    if (currentStep.actionObject.defaultClick.useAnythingInTable) {
        highlightAndScollTo(click.table, interval);
    } else {
        highlightAndScollTo(click.path, interval);
    }
    //UI
    popUpStepName.html(currentStep.name);
    popUpStepDescription.html(currentStep.description);
}

function manualInput(tutorialObj, currentStep, interval, showNext = true) {
    const inputObj = currentStep.actionObject;
    //const element = $(jqueryElementStringFromDomPath(inputObj.path)).first();
    highlightAndScollTo(inputObj.path, interval);
    //UI
    updateStepInstructionUIHelper(currentStep);
}

function manualSelect(tutorialObj, currentStep, interval, showNext = true) {
    const click = currentStep.actionObject.defaultClick;
    const element = $(jqueryElementStringFromDomPath(click.path)).first();
    if (currentStep.actionObject.defaultClick.useAnythingInTable) {
        highlightAndScollTo(click.table, interval);
    } else {
        highlightAndScollTo(click.path, interval);
    }
    //UI
    popUpStepName.html(currentStep.name);
    popUpStepDescription.html(currentStep.description);
}

function updateStepInstructionUIHelper(currentStep) {
    popUpStepName.html(currentStep.name);
    popUpStepDescription.html(currentStep.description);
}


async function showTutorialStepAuto() {
    callFunctionOnSwitchStepType(autoClick, autoClick, autoRedirect, autoInput, autoSelect)
}

var isAutomationInterrupt = false

function autoClick(tutorialObj, currentStep, interval, showNext = true) {
    const step = currentStep.actionObject.defaultClick;
    if (step.useAnythingInTable || currentStep.automationInterrupt) {
        //stop automation
        isAutomationInterrupt = true;
        manualStep(tutorialObj, currentStep, interval, showNext);
        return;
    }
    const element = $(jqueryElementStringFromDomPath(step.path))[0];
    highlightAndScollTo(step.path, interval, () => {
        simulateClick(element);
        incrementCurrentStepHelper(tutorialObj, showNext);
    });
}


function autoRedirect(tutorialObj, currentStep, interval) {
    const url = currentStep.actionObject.url;
    tutorialObj.currentStep = tutorialObj.currentStep + 1;
    syncStorageSet(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, tutorialObj, () => {
        location.replace(url);
    });
}

function autoInput(tutorialObj, currentStep, interval) {
    const step = currentStep.actionObject;
    //get and highlight input element
    const inputEle = $(jqueryElementStringFromDomPath(step.path)).first();

    highlightAndScollTo(step.path, interval, () => {
        //check if there is default input
        const defaultText = step.defaultText;
        // if (isNotNull(defaultText) && !isEmpty(defaultText)) {
        //     //fill input with default
        //     inputEle.val(defaultText);
        //     incrementCurrentStepHelper(tutorialObj);
        // } else {
        //     //asks for input

        // }        
        isAutomationInterrupt = true;
        manualInput(tutorialObj, currentStep, interval, showNext);
        return;
    });
}

/**
 * Stimulate any type of click using javascript's dispatch event. Covers cases where jquery.click() or 
 * .trigger('click') don't work
 * @param {HTML Element} element 
 */
function simulateClick(element, eventType = 'click') {
    isSimulatingClick = true;
    const evt = new MouseEvent(eventType, {
        view: window,
        bubbles: true,
        cancelable: true
    });
    element.dispatchEvent(evt);

}

function autoSelect(tutorialObj, currentStep, interval) {
    const step = currentStep.actionObject;
    //get and highlight input element
    const selectEle = $(jqueryElementStringFromDomPath(step.path)).first();
    highlightAndScollTo(step.path, interval, () => {
        //check if there is default input
        selectEle.val(step.defaultValue);
        //this step completed, go to next step
        incrementCurrentStepHelper(tutorialObj);
    });
}

function incrementCurrentStepHelper(tutorialObj, showNext = true, auto = true) {
    isAutomationInterrupt = false;
    tutorialObj.currentStep = tutorialObj.currentStep + 1;
    syncStorageSet(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, tutorialObj, () => {
        if (auto) {
            showNext && showTutorialStepAuto();
        } else {
            simulateClick(currentElement);
            showNext && showTutorialStepManual();
        }
    });
}

function onAutomationSpeedSliderChanged() {
    syncStorageSet(VALUES.STORAGE.AUTOMATION_SPEED, automationSpeedSlider.val());
}

//MARK: Start of recording events
var isSimulatingClick = false;
var globalEventsHandler = new GlobalEventsHandler();
chrome.storage.sync.get([VALUES.STORAGE.IS_RECORDING_ACTIONS, VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS], result => {
    globalEventsHandler.setIsRecordingCache(result[VALUES.STORAGE.IS_RECORDING_ACTIONS]);
    globalEventsHandler.setFollwingTutorialStatusCache(result[VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS]);
})

function addGlobalEventListeners() {
    $('*').on('blur focus focusin focusout change dblclick keydown keypress keyup mousedown mouseup select submit',
        preventDefaultHelper);
    $('*').on('click', onClickHelper);
}

function removeGlobalEventListeners() {
    $('*').off('blur focus focusin focusout change dblclick keydown keypress keyup mousedown mouseup select submit',
        preventDefaultHelper);
    $('*').off('click', onClickHelper);
}

var domPath = null;
var currentElement = null;
/**blur focus focusin focusout load resize scroll unload click " +
"dblclick mousedown mouseup mousemove mouseover mouseout mouseenter " + 
"mouseleave change select submit keydown keypress keyup error
*/


function onClickHelper(event) {
    preventDefaultHelper(event);
    if (event.target !== currentElement) {
        if (!isSimulatingClick) {
            processEventHelper(event.target);
        }
        isSimulatingClick = false;
    }
}

function processEventHelper(target) {
    domPath = getShortDomPathStack(target);
    if ($(jqueryElementStringFromDomPath(domPath)).length > 1) {
        domPath = getCompleteDomPathStack(target);
    }
    console.log(`clicking: ${domPath}`);
    currentElement = target;
    onClickUniversalHandler();
}

function preventDefaultHelper(event) {
    console.log(JSON.stringify(globalEventsHandler));
    if (!isSimulatingClick) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation()
    }
}


async function onClickUniversalHandler() {
    if (globalEventsHandler.isRecordingCache === true) {
        onClickWhenRecording();
    } else {
        switch (globalEventsHandler.followingTutorialStatusCache) {
            case VALUES.FOLLOWING_TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL:
                onClickWhenFollowingTutorial();
                break;
            default:
                break;
        }
    }
    if (isAutomationInterrupt) {
        onClickWhenFollowingTutorial();
    }
}

async function onClickWhenRecording() {
    //get element
    const jQElement = $(currentElement);

    syncStorageSet(VALUES.STORAGE.CURRENT_SELECTED_ELEMENT, domPath);

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



function onClickWhenFollowingTutorial() {
    //TODO: add regexp and handle user mistakes
    console.log('onClickWhenFollowingTutorial');
    callFunctionOnSwitchStepType(onClickWithStepTypeClick, onClickWithStepTypeClick, onClickWithStepTypeRedirect, onClickWithStepTypeInput, null);
    function onClickWithStepTypeClick(tutorialObj, currentStep, interval, showNext = true) {
        if (currentStep.actionObject.defaultClick.useAnythingInTable) {
            const tablePath = currentStep.actionObject.defaultClick.table;
            if (isSubArray(domPath, tablePath)) {
                incrementCurrentStepHelper(tutorialObj, true, false);
            } else {
                onClickedOnWrongElement(tablePath);
            }
        } else {
            const clickPath = currentStep.actionObject.defaultClick.path;
            if (isSubArray(domPath, clickPath)) {
                incrementCurrentStepHelper(tutorialObj, true, false);
                return;
            } else {
                onClickedOnWrongElement(clickPath);
            }
        }
    }

    function onClickWithStepTypeInput(tutorialObj, currentStep, interval, showNext = true) {
        const inputPath = currentStep.actionObject.path;
        if (isSubArray(domPath, inputPath)) {
            //TODO: record input and go to next step only when inputted one char
            incrementCurrentStepHelper(tutorialObj, true, false);
            return;
        } else {
            onClickedOnWrongElement(inputPath);
        }
    }

    function onClickWithStepTypeRedirect(tutorialObj, currentStep, interval, showNext = true) {

    }

    function onClickedOnWrongElement(path) {
        simulateClick(currentElement);
        highlightAndScollTo(path);
    }
}

var reHighlightAttempt = 0;
var lastSelectedElement = null;
var lastSelectedElementCSS = null;

function highlightAndScollTo(path, speed = 500, callback = () => { }) {
    const jQElement = $(jqueryElementStringFromDomPath(path));
    const htmlElement = jQElement[0];
    //Repeat if element not found, might not be handled here
    if (!isNotNull(htmlElement)) {
        if (reHighlightAttempt > 5) {
            //stop refinding element
            console.error("ELEMENT NOT FOUND");
            onStopTutorialButtonClicked();
            return;
        }
        reHighlightAttempt++;
        setTimeout(() => {
            highlightAndScollTo(path, speed, callback);
        }, 200);
        return;
    }
    reHighlightAttempt = 0;
    highlightAndRemoveLastHighlight(jQElement);
    $(getScrollParent(htmlElement, false)).animate({
        scrollTop: isNotNull(jQElement.offset()) ? max(0, parseInt(jQElement.offset().top) - window.innerHeight / 2) : 0
    }, speed).promise().then(() => {
        callback();
    })
}

function highlightAndRemoveLastHighlight(jQElement) {
    removeLastHighlight();
    lastSelectedElement = jQElement;
    lastSelectedElementCSS = jQElement.css(['box-shadow', 'padding', 'border', 'border-radius']);
    jQElement.css(CSS.HIGHLIGHT_BOX);
}

function removeLastHighlight() {
    if (isNotNull(lastSelectedElement)) {
        lastSelectedElement.css(lastSelectedElementCSS);
    }
}

//MARK: message handler
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (isNotNull(request.redirect)) {
            location.replace(request.redirect)
        }
        if (isNotNull(request.isRecordingStatus)) {
            globalEventsHandler.setIsRecordingCache(request.isRecordingStatus);
        }
        if (isNotNull(request.clickPath)) {
            simulateClick($(jqueryElementStringFromDomPath(request.clickPath))[0]);
        }
    }
);
