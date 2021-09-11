// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const firestoreRef = getFirestore(app);

//CONST
const currentUrl = $(location).attr('href');
const currentUrlObj = new URL(currentUrl);

//set up functions
async function setUp() {
    sendUnsentDomPath();
    checkFollowingTutorialStatus();
}

setUp();


//tutorial menu
$('body').append("<div id=\"main-popup-container\"></div>");
const mainPopUpContainer = $('#main-popup-container');
mainPopUpContainer.css(CSS.MAIN_OPTIONS_POPUP);
mainPopUpContainer.hide();

//stop tutorial options
$('body').append("<div id=\"main-stop-options-container\"></div>");
const mainStopOptionsContainer = $('#main-stop-options-container');
mainStopOptionsContainer.css(CSS.MAIN_STOP_OPTIONS_CONTAINER);
mainStopOptionsContainer.on('click', () => {
    onStopTutorialButtonClicked();
})
mainStopOptionsContainer.hide();

//bread
$('body').append("<div id=\"main-middle-popup-container\"></div>");
const mainMiddlePopupContainer = $('#main-middle-popup-container');
mainMiddlePopupContainer.css(CSS.MAIN_MIDDLE_POPUP);
mainMiddlePopupContainer.hide();

//MARK: Start of giving suggestions
class SimpleTutorial {
    constructor(steps) {
        this.steps = steps;
        this.currentStep = 0;
    }
};

class Step {
    constructor(path, index, action_type, description = "", redirect_to = "", input = "") {
        this.path = path;
        this.index = index;
        this.action_type = action_type;
        this.description = description;
        this.redirect_to = redirect_to;
        this.input = input;
    }
};

async function fetchSimpleTutorials() {
    mainPopUpContainer.empty();
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
            mainPopUpContainer.append(`<a href=\"#\" class=\"simple-tutorial-button\">${tutorial.data().name}</a>`);
            const button = $('.simple-tutorial-button');
            button.css(CSS.MAIN_OPTIONS_POPUP_SIMPLE_TUTORIAL_BUTTON);
            //button click function. store tutorial's steps to storage
            button.on('click', () => {
                onFollowTutorialButtonClicked(tutorial);
            });
        });
    }
};


async function onFollowTutorialButtonClicked(tutorial) {
    syncStorageSet(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, VALUES.FOLLOWING_TUTORIAL_STATUS.BEGAN_FOLLOWING_TUTORIAL);
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
        const stepObj = new Step(data.path, data.index, data.action_type, "", data.redirect_to, "");
        steps.push(stepObj);
    })
    //construct tutorial object
    const tutorialObj = new SimpleTutorial(steps)
    //object structure: tutorialObj.steps[i].path[i]. store object to storage
    syncStorageSet(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, tutorialObj);
    //toogle html elements
    mainPopUpContainer.hide();
    mainStopOptionsContainer.show();
    mainMiddlePopupContainer.show();
    //start showing step
    const currentStep = tutorialObj.steps[0]
    showTutorialStep();
}

async function onStopTutorialButtonClicked() {
    mainStopOptionsContainer.hide();
    syncStorageSet(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, VALUES.FOLLOWING_TUTORIAL_STATUS.NOT_FOLLOWING_TUTORIAL);
    fetchSimpleTutorials();
}



async function checkFollowingTutorialStatus() {
    chrome.storage.sync.get(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, (result) => {
        checkAndInitializeStorageIfUndefined(result, VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, VALUES.FOLLOWING_TUTORIAL_STATUS.NOT_FOLLOWING_TUTORIAL)
        switch (result[VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS]) {
            case VALUES.FOLLOWING_TUTORIAL_STATUS.BEGAN_FOLLOWING_TUTORIAL:
                mainStopOptionsContainer.show();
                showTutorialStep();
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


async function showTutorialStep() {
    chrome.storage.sync.get(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, result => {
        const tutorialObj = result[VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID];
        const currentStep = tutorialObj.steps[tutorialObj.currentStep];
        switch (currentStep.action_type) {
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK:
                highlightAndScollTo(currentStep.path);
                break;
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK_REDIRECT:
                highlightAndScollTo(currentStep.path);
                break;
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_REDIRECT:
                location.replace(currentStep.redirect_to);
                if (tutorialObj.currentStep + 1 < tutorialObj.steps.length) {
                    tutorialObj.currentStep = tutorialObj.currentStep + 1;

                    syncStorageSet(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, tutorialObj);


                } else {
                    onStopTutorialButtonClicked();
                }

                break;
            default:
                highlightAndScollTo(currentStep.path);
                break;
        }

    })
}


//MARK: Start of recording events
document.body.addEventListener('click', (event) => {
    chrome.storage.sync.get([VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, VALUES.STORAGE.IS_RECORDING_ACTIONS], (result) => {
        checkAndInitializeStorageIfUndefined(result, VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, VALUES.FOLLOWING_TUTORIAL_STATUS.NOT_FOLLOWING_TUTORIAL)
        if (result[VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS] === VALUES.FOLLOWING_TUTORIAL_STATUS.FOLLOWING_TUTORIAL) {
            onClickWhenFollowingTutorial(event);
        }
        checkAndInitializeStorageIfUndefined(result, VALUES.STORAGE.IS_RECORDING_ACTIONS, false)
        if (result[VALUES.STORAGE.IS_RECORDING_ACTIONS] === true) {
            onClickWhenRecording(event);
        }
    });
});



async function onClickWhenRecording(event) {
    const domPath = getDomPathStack(event.target);
    const element = $(jqueryElementStringFromDomPath(domPath));
    if (element.closest('a').attr('href') !== undefined) {
        //store this step to local storage first
        syncStorageSet(VALUES.STORAGE.UNSENT_DOM_PATH, domPath);
        syncStorageSet(VALUES.STORAGE.UNSENT_DOM_PATH_URL, currentUrl)
    } else {
        addStepToFirebase(domPath);
    }

    highlightAndScollTo(domPath)
}

async function sendUnsentDomPath() {
    const key = VALUES.STORAGE.UNSENT_DOM_PATH;
    chrome.storage.sync.get(key, (result) => {
        if (result[key]) {
            addStepToFirebase(result[key]);
            syncStorageSet(key, null);
            //resetting url is handled in post to firestore function
        }
    });
}



function onClickWhenFollowingTutorial(target) {
    const domPath = getDomPathStack(target);
    chrome.storage.sync.get(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, result => {
        var tutorialObj = result[VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID];
        const currentStep = tutorialObj.steps[tutorialObj.currentStep]
        if (arraysEqual(currentStep.path, domPath)) {
            //user clicked on highlighted element, go to next step if it exists
            if (tutorialObj.currentStep + 1 < tutorialObj.steps.length) {
                tutorialObj.currentStep = tutorialObj.currentStep + 1;

                syncStorageSet(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, tutorialObj);

                highlightAndScollTo(tutorialObj.steps[tutorialObj.currentStep].path)
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
 * 
 * @param {Array} pathStack 
 * @returns String of element path starting from the first ancestor with id attribute
 * stored in jquery element selector format: 'element > element...'
 */
function jqueryElementStringFromDomPath(pathStack) {
    var jqueryString = '';

    const numberOfElement = pathStack.length;
    for (let i = 0; i < numberOfElement; i++) {
        const currentElement = pathStack[i]
        if (currentElement[0] === '#') {
            //cut everything before it
            jqueryString = currentElement;
        } else {
            jqueryString += currentElement;
        }
        if (i == numberOfElement - 1) {
            break;
        }
        jqueryString += ' > '
    }
    return jqueryString
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

async function addStepToFirebase(data) {
    chrome.storage.sync.get(VALUES.RECORDING_STATUS.STATUS, (result) => {
        switch (result[VALUES.RECORDING_STATUS.STATUS]) {
            case VALUES.RECORDING_STATUS.BEGAN_RECORDING:
                postDocToFirebase(
                    data,
                    VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL,
                    VALUES.RECORDING_STATUS.BEGAN_RECORDING
                ).then(() => {
                    syncStorageSet(VALUES.RECORDING_STATUS.STATUS, VALUES.RECORDING_STATUS.RECORDING);
                })
                break;
            case VALUES.RECORDING_STATUS.RECORDING:
                postDocToFirebase(
                    data,
                    VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL,
                    VALUES.RECORDING_STATUS.RECORDING
                );
                break;
            default:
                break;
        };
    });
}

async function postDocToFirebase(data, type, status) {
    var docId;
    var stepIndex = 0;
    try {
        switch (status) {
            case VALUES.RECORDING_STATUS.BEGAN_RECORDING:
                const docRef = await addDoc(collection(firestoreRef, type), {});
                docId = docRef.id;
                syncStorageSet(VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID, docId);
                addTutorialStep(docId);
                break;
            case VALUES.RECORDING_STATUS.RECORDING:
                chrome.storage.sync.get([VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID, VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_STEP_INDEX], (result) => {
                    stepIndex = result[VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_STEP_INDEX] + 1;
                    docId = result[VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID];
                    addTutorialStep(docId);
                });
                break;
            default:
                break;
        }

    } catch (e) {
        console.error("Error adding document: ", e);
    }

    async function addTutorialStep(docId) {
        if (!isEmpty(docId)) {
            syncStorageSet(VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_STEP_INDEX, stepIndex)
            var urlToSend = currentUrl;
            var description = null;
            const urlKey = VALUES.STORAGE.UNSENT_DOM_PATH_URL;
            const descriptionKey = VALUES.STORAGE.DESCRIPTION_FOR_NEXT_STEP;
            //check if redirect results in unsent data and use previous url
            chrome.storage.sync.get([urlKey, descriptionKey], async result => {
                if (result[urlKey]) {
                    urlToSend = result[urlKey];
                    syncStorageSet(urlKey, null);
                }
                if (result[descriptionKey]) {
                    description = result[descriptionKey];
                    syncStorageSet(descriptionKey, null);
                }
                await addDoc(collection(firestoreRef, type, docId, "Steps"), {
                    path: data,
                    url: urlToSend,
                    index: stepIndex,
                    description: description,
                });
                const tutorialRef = doc(firestoreRef, type, docId);

                await updateDoc(tutorialRef, {
                    all_urls: arrayUnion(urlToSend)
                });
            })
        }
    }
}


//MARK: message handler
// chrome.runtime.onMessage.addListener(
//     function (request, sender, sendResponse) {
//         alert(request)
//         if (request.descriptionAdded)
//             alert(request.descriptionAdded);
//     }
// );