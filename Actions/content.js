// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const firestoreRef = getFirestore(app);

//CONST
const currentUrl = $(location).attr('href');

//tutorial menu
$('body').append("<div id=\"main-popup-container\" hidden></div>");
const mainPopUpContainer = $('#main-popup-container');

//stop tutorial options
$('body').append("<div id=\"main-stop-options-container\" hidden></div>");
const mainStopOptionsContainer = $('#main-stop-options-container');

//MARK: Start of giving suggestions
class SimpleTutorial {
    constructor(steps) {
        this.steps = steps;
        this.currentStep = 0;
    }
};

class Step {
    constructor(path, inputs, index) {
        this.path = path;
        this.inputs = inputs;
        this.index = index
    }
};

async function fetchSimpleTutorials() {
    const simpleTutorialQuery = query(collection(firestoreRef,
        VALUES.COLLECTION_NAMES.SIMPLE_TUTORIAL),
        where("all_urls", VALUES.FIRESTORE_QUERY_TYPES.ARRAY_CONTAINS, currentUrl)
    );

    const simpleTutorialQuerySnapshot = await getDocs(simpleTutorialQuery);
    if (!simpleTutorialQuerySnapshot.empty) {
        //create popup window
        mainPopUpContainer.css(CSS.MAIN_OPTIONS_POPUP);
        mainPopUpContainer.show();
        //iterate query to add tutorial buttons
        simpleTutorialQuerySnapshot.forEach((tutorial) => {
            mainPopUpContainer.append("<a href=\"#\" class=\"tutorial-button\">Tutorial</a>");
            const button = $('.tutorial-button');
            button.css(CSS.MAIN_OPTIONS_POPUP_TUTORIAL_BUTTON);
            //button click function. store tutorial's steps to storage
            button.on('click', () => {
                onFollowTutorialButtonClicked(tutorial);
            });
        });
    }
}

async function onFollowTutorialButtonClicked(tutorial) {
    syncStorageSet(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, VALUES.FOLLOWING_TUTORIAL_STATUS.FOLLOWING_TUTORIAL);
    syncStorageSet(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_ID, tutorial.id);
    //get all information about the tutorial from firebase
    const stepsQuery = query(collection(firestoreRef,
        VALUES.COLLECTION_NAMES.SIMPLE_TUTORIAL,
        tutorial.id,
        VALUES.COLLECTION_NAMES.SIMPLE_TUTORIAL_STEPS
    ), orderBy("index"));
    const stepsQuerySnapshot = await getDocs(stepsQuery);
    var steps = [];
    stepsQuerySnapshot.forEach((step) => {
        const data = step.data();
        const stepObj = new Step(data.path, [], data.index);
        steps.push(stepObj);
    })
    //construct tutorial object
    const tutorialObj = new SimpleTutorial(steps)
    //object structure: tutorialObj.steps[i].path[i]. store object to storage
    syncStorageSet(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, tutorialObj);
    //toogle html elements
    mainPopUpContainer.hide();
    mainStopOptionsContainer.show();
    //start showing step
    const currentStep = tutorialObj.steps[0]
    highlightAndScollTo(currentStep.path)
}

async function onStopTutorialButtonClicked() {
    mainStopOptionsContainer.hide();
    syncStorageSet(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, VALUES.FOLLOWING_TUTORIAL_STATUS.NOT_FOLLOWING_TUTORIAL);
    fetchSimpleTutorials();
}

async function checkFollowingTutorialStatus() {
    chrome.storage.sync.get(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, (result) => {
        switch (result[VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS]) {
            case VALUES.FOLLOWING_TUTORIAL_STATUS.FOLLOWING_TUTORIAL:
                showTutorialStep();
                mainStopOptionsContainer.show();
                mainStopOptionsContainer.css(CSS.MAIN_STOP_OPTIONS_CONTAINER);
                mainStopOptionsContainer.on('click', () => {
                    onStopTutorialButtonClicked();
                })
                break;
            case VALUES.FOLLOWING_TUTORIAL_STATUS.NOT_FOLLOWING_TUTORIAL:
                fetchSimpleTutorials();

                break;
            default:
                break;
        }
    })
}

checkFollowingTutorialStatus()

async function showTutorialStep() {
    chrome.storage.sync.get(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, result => {
        const tutorialObj = result[VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID];
        const currentStep = tutorialObj.steps[tutorialObj.currentStep]
        highlightAndScollTo(currentStep.path)
    })
}


//MARK: Start of recording events
document.body.addEventListener('click', (event) => {
    chrome.storage.sync.get(VALUES.STORAGE.IS_RECORDING_ACTIONS, (result) => {
        if (result[VALUES.STORAGE.IS_RECORDING_ACTIONS] === true) {
            onClickWhenRecording(event.target)
        }
    });
    chrome.storage.sync.get(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, (result) => {
        if (result[VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS] === VALUES.FOLLOWING_TUTORIAL_STATUS.FOLLOWING_TUTORIAL) {
            onClickWhenFollowingTutorial(event.target)
        }
    });
});


function onClickWhenRecording(target) {
    const domPath = getDomPathStack(target)
    addStepToFirebase(Array.from(domPath))
    highlightAndScollTo(domPath)
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

function highlightAndScollTo(pathStack) {
    element = $(jqueryElementStringFromDomPath(pathStack))
    //scrollTo(element)
    hightlight(element)
}

async function addStepToFirebase(data) {
    chrome.storage.sync.get(VALUES.RECORDING_STATUS.STATUS, (result) => {
        switch (result[VALUES.RECORDING_STATUS.STATUS]) {
            case VALUES.RECORDING_STATUS.BEGAN_RECORDING:
                postDocToFirebase(data, VALUES.COLLECTION_NAMES.SIMPLE_TUTORIAL, VALUES.RECORDING_STATUS.BEGAN_RECORDING);
                syncStorageSet(VALUES.RECORDING_STATUS.STATUS, VALUES.RECORDING_STATUS.RECORDING);
                break;
            case VALUES.RECORDING_STATUS.RECORDING:
                postDocToFirebase(data, VALUES.COLLECTION_NAMES.SIMPLE_TUTORIAL, VALUES.RECORDING_STATUS.RECORDING);
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
                chrome.storage.sync.get(VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID, (tutorial_id_result) => {
                    chrome.storage.sync.get(VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_STEP_INDEX, (index_result) => {
                        stepIndex = index_result[VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_STEP_INDEX] + 1;
                        docId = tutorial_id_result[VALUES.RECORDING_ID.CURRENT_RECORDING_TUTORIAL_ID];
                        addTutorialStep(docId)
                    })
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
            await addDoc(collection(firestoreRef, type, docId, "Steps"), {
                path: data,
                url: currentUrl,
                index: stepIndex
            });
            const tutorialRef = doc(firestoreRef, type, docId);

            await updateDoc(tutorialRef, {
                all_urls: arrayUnion(currentUrl)
            });
        }
    }
}


