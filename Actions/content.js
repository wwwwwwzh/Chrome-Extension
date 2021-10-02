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
    const url_matches = [currentUrl];
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
        showTutorialStepAuto();
    })
}

async function onPopUpManualButtonClicked(tutorial) {
    loadTutorialToStorage(tutorial).then(() => {
        syncStorageSet(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, VALUES.FOLLOWING_TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL);
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
    var isFirstStepReached = false;
    stepsQuerySnapshot.forEach((step) => {
        const data = step.data();
        //remove steps used prior to accessing this page
        if (isFirstStepReached) {
            steps.push(data);
        } else {
            if (data.url === currentUrl) {
                isFirstStepReached = true;
                steps.push(data);
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
    syncStorageSet(VALUES.STORAGE.REVISIT_PAGE_COUNT, 0);
    fetchSimpleTutorials();
}



async function checkFollowingTutorialStatus() {
    chrome.storage.sync.get(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, (result) => {
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

async function showTutorialStepGeneric(onStepActionClick, onStepActionClickRedirect, onStepActionRedirect, onStepActionInput, onStepActionSelect) {
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
    showTutorialStepGeneric(manualStep, manualStep);
}

function manualStep(tutorialObj, currentStep, interval, showNext = true) {
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


async function showTutorialStepAuto() {
    showTutorialStepGeneric(autoClick, autoClick, autoRedirect, autoInput, autoSelect)
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
        if (isNotNull(defaultText) && !isEmpty(defaultText)) {
            //fill input with default
            inputEle.val(defaultText);
        } else {
            //asks for input

        }
        //this step completed, go to next step
        incrementCurrentStepHelper(tutorialObj);
    });
}

/**
 * Stimulate any type of click using javascript's dispatch event. Covers cases where jquery.click() or 
 * .trigger('click') don't work
 * @param {HTML Element} element 
 */
function simulateClick(element) {
    const evt = new MouseEvent('click', {
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
            showNext && showTutorialStepManual();
        }
    });
}

function onAutomationSpeedSliderChanged() {
    syncStorageSet(VALUES.STORAGE.AUTOMATION_SPEED, automationSpeedSlider.val());
}

//MARK: Start of recording events
var isRecordingCache = false;
chrome.storage.sync.get(VALUES.STORAGE.IS_RECORDING_ACTIONS, result => {
    isRecordingCache = result[VALUES.STORAGE.IS_RECORDING_ACTIONS];
})


/**blur focus focusin focusout load resize scroll unload click " +
"dblclick mousedown mouseup mousemove mouseover mouseout mouseenter " + 
"mouseleave change select submit keydown keypress keyup error
*/
$(() => {
    $('*').bind('blur focus focusin focusout change dblclick keydown keypress keyup mousedown mouseup select submit', event => {
        preventDefaultHelper(event);
    });

    $('*').bind('click', event => {
        if (isRecordingCache) {
            preventDefaultHelper(event);
            onClickUniversalHandler(event);
            console.log(event.type)
        }
    });

    $(document.body).bind('click', event => {
        if (!isRecordingCache) {
            onClickUniversalHandler(event);
            console.log(event.type)
        }
    });
})

function preventDefaultHelper(event) {
    if (isRecordingCache) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation()
    }
}


async function onClickUniversalHandler(event) {
    chrome.storage.sync.get([VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, VALUES.STORAGE.IS_RECORDING_ACTIONS], (result) => {
        if (result[VALUES.STORAGE.IS_RECORDING_ACTIONS] === true) {
            onClickWhenRecording(event);
        }
        switch (result[VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS]) {
            case VALUES.FOLLOWING_TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL:
                onClickWhenFollowingTutorial(event);
                break;
            default:
                break;
        }
        if (isAutomationInterrupt) {
            onClickWhenFollowingTutorial(event);
        }
    });
}

async function onClickWhenRecording(event) {
    //get element
    const domPath = getDomPathStack(event.target);
    const jQElement = $(event.target);

    syncStorageSet(VALUES.STORAGE.CURRENT_SELECTED_ELEMENT, domPath);

    //get table if it exists for tutorial
    const nearestTable = getNearestTableOrList(jQElement[0]);
    if (!isNotNull(nearestTable)) {
        syncStorageSet(VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE, null);
    } else {
        syncStorageSet(VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE, getDomPathStack(nearestTable));
    }
    //Highlight
    if (jQElement.is('a')) {
        highlightAndRemoveLastHighlight(jQElement.parent());
    } else {
        highlightAndRemoveLastHighlight(jQElement);
    }
}

function onClickWhenFollowingTutorial(event) {
    const domPath = getDomPathStack(event.target);
    chrome.storage.sync.get([VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, VALUES.STORAGE.AUTOMATION_SPEED, VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS], result => {
        const tutorialObj = result[VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID];
        const currentStep = tutorialObj.steps[tutorialObj.currentStep];
        const interval = intervalFromSpeed(result[VALUES.STORAGE.AUTOMATION_SPEED]);
        if (tutorialObj.currentStep >= tutorialObj.steps.length) {
            onStopTutorialButtonClicked();
        } else if (currentUrl !== currentStep.url) {
            //onEnteredWrongPage(tutorialObj, currentStep.url);
        } else {
            //syncStorageSet(VALUES.STORAGE.REVISIT_PAGE_COUNT, 0);
            switch (currentStep.actionType) {
                case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK:
                    if (currentStep.actionObject.defaultClick.useAnythingInTable) {
                        if (isSubArray(domPath, currentStep.actionObject.defaultClick.table)) {
                            incrementCurrentStepHelper(tutorialObj, true, false);
                        }
                    } else {
                        if (isSubArray(domPath, currentStep.actionObject.defaultClick.path)) {
                            incrementCurrentStepHelper(tutorialObj, true, false);
                        }
                    }
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
            return;
        }
        reHighlightAttempt++;
        setTimeout(() => {
            highlightAndScollTo(path, speed, callback);
        }, 200);
        return;
    }
    highlightAndRemoveLastHighlight(jQElement);
    alert(max(0, parseInt(jQElement.offset().top) - window.innerHeight / 2));
    $(getScrollParent(htmlElement, false)).animate({
        scrollTop: isNotNull(jQElement.offset()) ? max(0, parseInt(jQElement.offset().top) - window.innerHeight / 2) : 0
    }, speed).promise().then(() => {
        callback();
    })
}

function highlightAndRemoveLastHighlight(jQElement) {
    if (isNotNull(lastSelectedElement)) {
        lastSelectedElement.css(lastSelectedElementCSS);
    }
    lastSelectedElement = jQElement;
    lastSelectedElementCSS = jQElement.css(['box-shadow', 'padding', 'border', 'border-radius']);
    jQElement.css(CSS.HIGHLIGHT_BOX);
}

//MARK: message handler
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (isNotNull(request.redirect)) {
            location.replace(request.redirect)
        }
        if (isNotNull(request.isRecordingStatus)) {
            isRecordingCache = request.isRecordingStatus;
        }
        if (isNotNull(request.clickPath)) {
            simulateClick($(jqueryElementStringFromDomPath(request.clickPath))[0]);
        }
    }
);
