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
    setUpIframeListner();
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


async function onFollowTutorialButtonClicked(tutorial) {
    //toogle html elements
    mainPopUpContainer.hide();
    mainStopOptionsContainer.show();
    automationSpeedSliderHelper(mainStopOptionsContainer, true);
    mainMiddlePopupContainer.show();

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
        mainMiddlePopupContainer.hide();
        showTutorialStepAuto();
    })
}

async function onPopUpManualButtonClicked(tutorial) {
    loadTutorialToStorage(tutorial).then(() => {
        syncStorageSet(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, VALUES.FOLLOWING_TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL);
        mainMiddlePopupContainer.hide();
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
    syncStorageSet(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, VALUES.FOLLOWING_TUTORIAL_STATUS.NOT_FOLLOWING_TUTORIAL);
    syncStorageSet(VALUES.STORAGE.REVISIT_PAGE_COUNT, 0);
    fetchSimpleTutorials();
}



async function checkFollowingTutorialStatus() {
    chrome.storage.sync.get(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, (result) => {
        switch (result[VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS]) {
            case VALUES.FOLLOWING_TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL:
                mainStopOptionsContainer.show();
                showTutorialStepManual();
                break;
            case VALUES.FOLLOWING_TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL:
                mainStopOptionsContainer.show();
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
            syncStorageSet(VALUES.STORAGE.REVISIT_PAGE_COUNT, 0);
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
    showTutorialStepGeneric(highlightNextStepManual, highlightNextStepManual);
}

function highlightNextStepManual(tutorialObj, currentStep, interval, showNext = true) {
    const step = currentStep.actionObject.defaultClick;
    const element = $(jqueryElementStringFromDomPath(step.path)).first();
    highlightAndScollTo(step.path, interval);
}


async function showTutorialStepAuto() {
    showTutorialStepGeneric(autoClick, autoClick, autoRedirect, autoInput, autoSelect)
}

function autoClick(tutorialObj, currentStep, interval, showNext = true) {
    const step = currentStep.actionObject.defaultClick;
    const element = $(jqueryElementStringFromDomPath(step.path))[0];
    highlightAndScollTo(step.path, interval, () => {
        simulateClick(element);
        incrementCurrentStepHelper(tutorialObj, showNext);
    });
}

/**
 * Stimulate any type of click using javascript's dispatch event. Covers cases where jquery.click() or 
 * .trigger('click') don't work
 * @param {HTTPS Element} element 
 */
function simulateClick(element) {
    // var evt = document.createEvent("MouseEvents");
    // evt.initMouseEvent("click", true, true, window,
    //     0, 0, 0, 0, 0, false, false, false, false, 0, null);
    const evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });
    element.dispatchEvent(evt);
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
        if (isNotNull(defaultText) && defaultText.length > 0) {
            //fill input with default
            inputEle.val(defaultText);
        } else {
            //asks for input

        }
        //this step completed, go to next step
        incrementCurrentStepHelper(tutorialObj);
    });
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
    tutorialObj.currentStep = tutorialObj.currentStep + 1;
    syncStorageSet(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, tutorialObj, () => {
        if (auto) {
            showNext && showTutorialStepAuto();
        } else {
            //alert(1)
            showNext && showTutorialStepManual();
        }
    });
}

function onAutomationSpeedSliderChanged() {
    syncStorageSet(VALUES.STORAGE.AUTOMATION_SPEED, automationSpeedSlider.val());
}

//TODO: Solve the stop events while recordinig problem.
var isRecordingCache = false;
//MARK: Start of recording events
document.body.addEventListener('click', async (event) => {
    //stop default action
    if (isRecordingCache) {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
    }

    onClickUniversalHandler(event);
}, true);

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

    });
}



async function onClickWhenRecording(event) {

    //get element
    const domPath = getDomPathStack(event.target);

    syncStorageSet(VALUES.STORAGE.CURRENT_SELECTED_ELEMENT, domPath);

    hightlight(domPath);
}

async function sendUnsentDomPath() {
    const key = VALUES.STORAGE.UNSENT_DOM_PATH;
    chrome.storage.sync.get(key, (result) => {
        if (result[key]) {
            //addStepToFirebase(result[key]);
            syncStorageSet(key, null);
            //resetting url is handled in post to firestore function
        }
    });
}



function onClickWhenFollowingTutorial(event) {
    const domPath = getDomPathStack(event.target);
    chrome.storage.sync.get([VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, VALUES.STORAGE.AUTOMATION_SPEED], result => {
        const tutorialObj = result[VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID];
        const currentStep = tutorialObj.steps[tutorialObj.currentStep];
        const interval = intervalFromSpeed(result[VALUES.STORAGE.AUTOMATION_SPEED]);
        if (tutorialObj.currentStep >= tutorialObj.steps.length) {
            onStopTutorialButtonClicked();
        } else if (currentUrl !== currentStep.url) {
            //onEnteredWrongPage(tutorialObj, currentStep.url);
        } else {
            syncStorageSet(VALUES.STORAGE.REVISIT_PAGE_COUNT, 0);
            switch (currentStep.actionType) {
                case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK:
                    if (isSubArray(domPath, currentStep.actionObject.defaultClick.path)) {
                        incrementCurrentStepHelper(tutorialObj, true, false);
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

/**
 * 
 * @param {*} element DOM element
 * @returns Path of element starting with "body" stored in a stack. Elements with id
 * attribute are stored as #id
 */
function getDomPathStack(element) {
    var stack = [];
    while (element.parentNode != null) {
        var sibCount = 0;
        var sibIndex = 0;
        for (var i = 0; i < element.parentNode.childNodes.length; i++) {
            var sib = element.parentNode.childNodes[i];
            if (sib.nodeName == element.nodeName) {
                if (sib === element) {
                    sibIndex = sibCount;
                }
                sibCount++;
            }
        }
        if (element.hasAttribute('id') && element.id != '') {
            stack.unshift('#' + element.id);
            return stack;
        } else if (sibCount > 1) {
            stack.unshift(element.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
        } else {
            stack.unshift(element.nodeName.toLowerCase());
        }
        element = element.parentNode;
    }
    return stack.slice(1); // removes the html element
}


/**
 * Highlight the element with a growing border
 * @param {jQuery | [string]} element An jQuery instance or an array of strings representing path to a DOM element
 */
function hightlight(element) {
    if (element instanceof jQuery) {
        element.css(CSS.HIGHLIGHT_BOX);
    } else if (isNotNull(element.length)) {
        $(jqueryElementStringFromDomPath(element)).first().css(CSS.HIGHLIGHT_BOX);
    } else {
        alert('element type wrong');
    }
}

function highlightAndScollTo(path, speed = 500, callback = () => { }) {
    const element = $(jqueryElementStringFromDomPath(path)).first();
    $('html, body').first().animate({
        scrollTop: isNotNull(element.offset()) ? parseInt(element.offset().top) : 0
    }, speed).promise().then(() => {
        element.css(CSS.HIGHLIGHT_BOX);
        callback();
    })
}

//MARK: message handler
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (isNotNull(request.redirect)) {
            location.replace(request.redirect)
        } else if (isNotNull(request.isRecordingStatus)) {
            isRecordingCache = request.isRecordingStatus;
        }
    }
);
