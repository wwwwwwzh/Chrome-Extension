// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const firestoreRef = getFirestore(app);

//MARK: Start of giving suggestions


//MARK: Start of recording events
document.body.addEventListener('click', (event) => {
    chrome.storage.sync.get(VALUES.STORAGE.IS_RECORDING_ACTIONS, (result) => {
        if (result[VALUES.STORAGE.IS_RECORDING_ACTIONS] === true) {
            universalClickHandler(event.target)
        }
    });
});


function universalClickHandler(data) {
    const domPath = getDomPathStack(data)
    postNewTutorialToFirebase(Array.from(domPath))
    highlightAndScollTo(domPath)
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

async function postNewTutorialToFirebase(data) {
    chrome.storage.sync.get(VALUES.RECORDING_STATUS.STATUS, (result) => {
        switch (result[VALUES.RECORDING_STATUS.STATUS]) {
            case VALUES.RECORDING_STATUS.BEGAN_RECORDING:
                postDocToFirebase(data, "Simple Tutorials", VALUES.RECORDING_STATUS.BEGAN_RECORDING);
                syncStorageSet(VALUES.RECORDING_STATUS.STATUS, VALUES.RECORDING_STATUS.RECORDING);
                break;
            case VALUES.RECORDING_STATUS.RECORDING:
                postDocToFirebase(data, "Simple Tutorials", VALUES.RECORDING_STATUS.RECORDING);
                break;
            default:
                break;
        };
    });
}

async function postDocToFirebase(data, type, status) {
    var docId;
    try {
        switch (status) {
            case VALUES.RECORDING_STATUS.BEGAN_RECORDING:
                const docRef = await addDoc(collection(firestoreRef, type), {});
                docId = docRef.id
                syncStorageSet(VALUES.RECORDING_ID.CURRENT_TUTORIAL_ID, docId)
                addTutorialStep(docId)
                break;
            case VALUES.RECORDING_STATUS.RECORDING:
                chrome.storage.sync.get(VALUES.RECORDING_ID.CURRENT_TUTORIAL_ID, (result) => {
                    docId = result[VALUES.RECORDING_ID.CURRENT_TUTORIAL_ID];
                    addTutorialStep(docId)
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
            const addr = $(location).attr('href')
            await addDoc(collection(firestoreRef, type, docId, "Steps"), {
                path: data,
                url: addr
            });
            const tutorialRef = doc(firestoreRef, type, docId);

            await updateDoc(tutorialRef, {
                all_urls: arrayUnion(addr)
            });
        }
    }
}


