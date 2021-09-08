// Initialize Firebase
//alert("firebaseConfig")
//const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// const db = getFirestore(app);
const CSS = {
    HIGHLIGHT_BOX: {
        'box-shadow': '0 0 20px rgba(255, 203, 42, 1)',
        'padding': '5px',
        'margin': '3px',
        'border': '3px solid rgba(246, 131, 11, 0.5)',
        'border-radius': '5px'
    }
}
document.body.addEventListener('click', (event) => {
    universalClickHandler(event.target)
});

function universalClickHandler(data) {
    const domPath = getDomPathStack(data)
    //postToFirebase(domPath)
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
    //alert(pathStack)
    element = $(jqueryElementStringFromDomPath(pathStack))
    //scrollTo(element)
    hightlight(element)
}

async function postNewTutorialToFirebase(data) {
    try {
        const docRef = await addDoc(collection(db, "users"), {
            name: data
        });
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}
