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

        let iframeBodyJQ = $(iFrameBody);
        iframeBodyJQ.on('click', async (event) => {
            onClickUniversalHandler(event);
        })
    }
}

setUp();

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
    const simpleTutorialQuery = query(collection(firestoreRef,
        VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL),
        where(
            VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL_ALL_URLS,
            VALUES.FIRESTORE_QUERY_TYPES.ARRAY_CONTAINS_ANY,
            [domainName, currentUrl]
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
            const button = $(`#${tutorial.id}`);
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
    stepsQuerySnapshot.forEach((step) => {
        const data = step.data();
        steps.push(data);
    })

    //construct tutorial object
    const tutorialObj = new SimpleTutorial(steps)
    //object structure: tutorialObj.steps[i].path[i]. store object to storage
    syncStorageSet(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, tutorialObj);

}

async function onStopTutorialButtonClicked() {
    mainStopOptionsContainer.hide();
    syncStorageSet(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, VALUES.FOLLOWING_TUTORIAL_STATUS.NOT_FOLLOWING_TUTORIAL);
    fetchSimpleTutorials();
}



async function checkFollowingTutorialStatus() {
    chrome.storage.sync.get(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, (result) => {
        checkAndInitializeStorageIfUndefined(result, VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, VALUES.FOLLOWING_TUTORIAL_STATUS.NOT_FOLLOWING_TUTORIAL);
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


async function showTutorialStepManual() {
    chrome.storage.sync.get([VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID], result => {
        const tutorialObj = result[VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID];
        const currentStep = tutorialObj.steps[tutorialObj.currentStep];

        switch (currentStep.actionType) {
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK:
                highlightAndScollTo(currentStep.path);
                break;
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK_REDIRECT:
                highlightAndScollTo(currentStep.path);
                break;
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_REDIRECT:
                location.replace(currentStep.redirect_to);
                break;
            default:
                highlightAndScollTo(currentStep.path);
                break;
        }


    })
}

async function showTutorialStepAuto() {
    //alert('show')
    chrome.storage.sync.get([VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, VALUES.STORAGE.AUTOMATION_SPEED], result => {
        const tutorialObj = result[VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID];
        const currentStep = tutorialObj.steps[tutorialObj.currentStep];
        const interval = intervalFromSpeed(result[VALUES.STORAGE.AUTOMATION_SPEED]);
        if (tutorialObj.currentStep >= tutorialObj.steps.length) {
            onStopTutorialButtonClicked();
        } else {
            switch (currentStep.actionType) {
                case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK:
                    autoPerformStep(currentStep.actionObject.defaultClick, tutorialObj, interval);
                    break;
                case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK_REDIRECT:
                    autoPerformStep(currentStep.actionObject.defaultClick, tutorialObj, interval);
                    break;
                case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_REDIRECT:
                    tutorialObj.currentStep = tutorialObj.currentStep + 1;
                    syncStorageSet(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, tutorialObj, () => {
                        location.replace(currentStep.actionObject.url);
                    });
                    break;
                case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_INPUT:
                    autoPerformStep(currentStep.actionObject, tutorialObj, interval);
                    break;
                case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_SELECT:
                    autoPerformStep(currentStep.actionObject, tutorialObj, interval);
                    break;
                default:
                    autoPerformStep(currentStep, tutorialObj, interval);
                    break;
            }
        }
    })
}

function autoPerformStep(step, tutorialObj, interval) {
    const element = $(jqueryElementStringFromDomPath(step.path));
    highlightAndScollTo(step.path);
    setTimeout(() => {
        element.trigger("click");
    }, min(interval, 100));

    //this step completed, go to next step
    tutorialObj.currentStep = tutorialObj.currentStep + 1;
    syncStorageSet(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, tutorialObj, () => {
        setTimeout(() => {
            showTutorialStepAuto();
        }, interval);
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
        checkAndInitializeStorageIfUndefined(result, VALUES.STORAGE.IS_RECORDING_ACTIONS, false)
        isRecordingCache = result[VALUES.STORAGE.IS_RECORDING_ACTIONS];
        if (result[VALUES.STORAGE.IS_RECORDING_ACTIONS] === true) {
            onClickWhenRecording(event);
        }
        checkAndInitializeStorageIfUndefined(result, VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, VALUES.FOLLOWING_TUTORIAL_STATUS.NOT_FOLLOWING_TUTORIAL)
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

    highlightAndScollTo(domPath)
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
    chrome.storage.sync.get(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, result => {
        var tutorialObj = result[VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID];
        const currentStep = tutorialObj.steps[tutorialObj.currentStep];
        if (isSubArray(domPath, currentStep.path)) {
            //user clicked on highlighted element, go to next step if it exists
            if (tutorialObj.currentStep + 1 < tutorialObj.steps.length) {
                //not last step
                tutorialObj.currentStep = tutorialObj.currentStep + 1;
                syncStorageSet(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, tutorialObj);
            } else {
                //last step
                onStopTutorialButtonClicked();
            }
            showTutorialStepManual();
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



function hightlight(element) {
    if (typeof element === 'string') {
        $(jqueryElementStringFromDomPath(element)).css(CSS.HIGHLIGHT_BOX)
    } else if (typeof element === 'object') {
        element.css(CSS.HIGHLIGHT_BOX)
    }
}

function highlightAndScollTo(path) {
    const element = $(jqueryElementStringFromDomPath(path));
    hightlight(element);
}

// async function addStepToFirebase(data) {
//     chrome.storage.sync.get(VALUES.RECORDING_STATUS.STATUS, (result) => {
//         switch (result[VALUES.RECORDING_STATUS.STATUS]) {
//             case VALUES.RECORDING_STATUS.BEGAN_RECORDING:
//                 postDocToFirebase(
//                     data,
//                     VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL,
//                     VALUES.RECORDING_STATUS.BEGAN_RECORDING
//                 ).then(() => {
//                     syncStorageSet(VALUES.RECORDING_STATUS.STATUS, VALUES.RECORDING_STATUS.RECORDING);
//                 })
//                 break;
//             case VALUES.RECORDING_STATUS.RECORDING:
//                 postDocToFirebase(
//                     data,
//                     VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL,
//                     VALUES.RECORDING_STATUS.RECORDING
//                 );
//                 break;
//             default:
//                 break;
//         };
//     });
// }

// async function postDocToFirebase(data, type, status) {
//     var docId;
//     var stepIndex = 0;
//     try {
//         switch (status) {
//             case VALUES.RECORDING_STATUS.BEGAN_RECORDING:
//                 chrome.storage.sync.get(VALUES.STORAGE.CURRENT_RECORDING_TUTORIAL_NAME, async result => {
//                     const docRef = await addDoc(collection(firestoreRef, type), {
//                         name: result[VALUES.STORAGE.CURRENT_RECORDING_TUTORIAL_NAME],
//                     });
//                     docId = docRef.id;
//                     syncStorageSet(VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID, docId);
//                     addTutorialStep(docId);
//                 })

//                 break;
//             case VALUES.RECORDING_STATUS.RECORDING:
//                 chrome.storage.sync.get([VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID, VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_STEP_INDEX], (result) => {
//                     stepIndex = result[VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_STEP_INDEX] + 1;
//                     docId = result[VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID];
//                     addTutorialStep(docId);
//                 });
//                 break;
//             default:
//                 break;
//         }

//     } catch (e) {
//         console.error("Error adding document: ", e);
//     }

//     async function addTutorialStep(docId) {
//         if (!isEmpty(docId)) {
//             syncStorageSet(VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_STEP_INDEX, stepIndex);
//             var urlToSend = currentUrl;
//             var description = null;
//             var actionType = VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK;
//             const urlKey = VALUES.STORAGE.UNSENT_DOM_PATH_URL;
//             const descriptionKey = VALUES.STORAGE.DESCRIPTION_FOR_NEXT_STEP;
//             const stepActionTypeKey = VALUES.STORAGE.STEP_ACTION_TYPE;
//             //check if redirect results in unsent data and use previous url
//             chrome.storage.sync.get([urlKey, descriptionKey, stepActionTypeKey], async result => {
//                 if (result[urlKey]) {
//                     urlToSend = result[urlKey];
//                     syncStorageSet(urlKey, null);
//                 }
//                 if (result[descriptionKey]) {
//                     description = result[descriptionKey];
//                     syncStorageSet(descriptionKey, null);
//                 }
//                 actionType = result[stepActionTypeKey];
//                 syncStorageSet(stepActionTypeKey, VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK);
//                 //doc object
//                 var docToAdd = {
//                     path: data,
//                     url: urlToSend,
//                 };
//                 docToAdd[VALUES.FIRESTORE_CONSTANTS.STEP_ACTION_TYPE] = actionType;
//                 docToAdd[VALUES.FIRESTORE_CONSTANTS.STEP_DESCRIPTION] = description;
//                 docToAdd[VALUES.FIRESTORE_CONSTANTS.STEP_INDEX] = stepIndex;

//                 await addDoc(collection(firestoreRef, type, docId, "Steps"), docToAdd);
//                 const tutorialRef = doc(firestoreRef, type, docId);

//                 await updateDoc(tutorialRef, {
//                     all_urls: arrayUnion(urlToSend),
//                 });
//             })
//         }
//     }
// }

//MARK: message handler
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (typeof request.redirect !== 'undefined')
            location.replace(request.redirect)
    }
);
