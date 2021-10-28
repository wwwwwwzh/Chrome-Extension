const firebaseConfig = {
    apiKey: "AIzaSyD2iKakYgBqJ2T6CVQpzHZIjzJW8k0JQTo",
    authDomain: "test-e7bb0.firebaseapp.com",
    projectId: "test-e7bb0",
    storageBucket: "test-e7bb0.appspot.com",
    messagingSenderId: "84428320764",
    appId: "1:84428320764:web:26669d7f6e21cae5650c79",
    measurementId: "G-LM6FVJF8S6"
}

// const CSS = {
//     HIGHLIGHT_INSTRUCTION_WINDOW: {
//         "position": "fixed",
//         'max-width': '300px',
//         'padding': '12px',
//         'background-color': 'rgba(255,165,0,0.4)',
//         'border-radius': '6px',
//         'z-index': 2147483647,
//     },
//     HIGHLIGHT_BOX: {
//         'box-shadow': '0px 0px 20px 10px rgba(255, 203, 42, 1)',
//         'padding': '3px',
//         'border': '2px solid rgba(246, 131, 11, 0.5)',
//         'border-radius': '5px'
//     },
//     MAIN_POPUP_START_POSITION: {
//         "top": '12px',
//         "left": '12px',
//     },
//     MAIN_POPUP: {
//         'display': 'block',
//         "position": "fixed",
//         'width': '200px',
//         'height': '300px',
//         'padding': '12px',
//         'background-color': 'rgba(255,165,0,0.7)',
//         'border-radius': '6px',
//         'z-index': 2147483647,
//     },
//     POPUP_COLLAPSED: {
//         'width': CLOSE_BUTTON_WIDTH + CLOSE_BUTTON_OFFSET * 2,
//         'height': CLOSE_BUTTON_WIDTH + CLOSE_BUTTON_OFFSET * 2,
//         'border-radius': CLOSE_BUTTON_RADIUS,
//     },
//     BUTTON: {
//         'display': 'block',
//         "box-shadow": "inset 0px 0px 0px 0px #cf866c",
//         'background-color': '#e74c3c',
//         "border-radius": "6px",
//         "cursor": "pointer",
//         "color": "#ffffff",
//         "font-family": "Arial",
//         "font-size": "14px",
//         "padding": "12px 18px",
//         "margin": '6px',
//         "text-decoration": "none",
//         "text-shadow": "0px 1px 0px #854629",
//     },
//     BUTTON_HOVER: {
//         'background-color': '#c0392b',
//     },
//     POPUP_HEADER: {
//         'display': 'block',
//         'width': '100%',
//         'padding': '6px',
//         'margin-bottom': '12px'
//     },
//     CLOSE_BUTTON: {
//         'display': 'block',
//         'cursor': 'pointer',
//         'position': 'absolute',
//         'top': CLOSE_BUTTON_OFFSET,
//         'right': CLOSE_BUTTON_OFFSET,
//         'font-size': '30px',
//         'width': CLOSE_BUTTON_WIDTH,
//         'height': CLOSE_BUTTON_WIDTH,
//         'text-align': 'center',
//         'border-radius': CLOSE_BUTTON_RADIUS
//     },
//     POPUP_DRAGGABLE: {
//         "position": "relative",
//         'top': '0px',
//         'left': '0px',
//         'right': '0px',
//         'bottom': '0px',
//         'border-radius': '6px',
//         'z-index': -1,
//     },
//     AUTOMATION_SPEED_SLIDER: {
//         'display': 'block',
//         "position": "absolute",
//         'bottom': '6px',
//         'left': '6px',
//         'right': '6px',
//         'padding': '6px 6px 6px 6px',
//         'width': '-moz-calc(100% - 24px)',
//         'width': '-webkit-calc(100% - 24px)',
//         'width': '-o-calc(100% - 24px)',
//         'width': 'calc(100% - 24px)',
//         "height": "25px",
//         "background": "#d3d3d3",
//         "outline": "none",
//         "transition": "opacity .2s",
//     },
//     WRONG_PAGE_REDIRECT_BUTTON: {
//         'display': 'block',
//         'max-width': '260px',
//         'overflow-wrap': 'break-word',
//         'color': 'black',
//         'margin-top': '20px',
//         'padding': '6px',
//     }
// }

const VALUES = {
    INPUT_TYPES: {
        TEXT: "INPUT_TYPES_TEXT",
        URL: "INPUT_TYPES_URL",

    },
    STORAGE: {
        CURRENT_RECORDING_TUTORIAL_NAME: 'CURRENT_RECORDING_TUTORIAL_NAME',
        IS_RECORDING_TUTORIAL: 'IS_RECORDING_TUTORIAL',
        IS_RECORDING_ACTIONS: 'IS_RECORDING_ACTIONS',
        CURRENT_URL: "CURRENT_URL",
        UNSENT_DOM_PATH: "UNSENT_DOM_PATH",
        UNSENT_DOM_PATH_URL: "UNSENT_DOM_PATH_URL",
        //DESCRIPTION_FOR_NEXT_STEP: "DESCRIPTION_FOR_NEXT_STEP",
        STEP_ACTION_TYPE: "STEP_ACTION_TYPE",
        //STEP_ACTION_INPUT_VALUE: "STEP_ACTION_INPUT_VALUE",
        AUTOMATION_SPEED: "AUTOMATION_SPEED",
        CURRENT_STEP_OBJ: "CURRENT_STEP_OBJ",
        CURRENT_SELECTED_ELEMENT: "CURRENT_SELECTED_ELEMENT",
        CURRENT_SELECTED_ELEMENT_PARENT_TABLE: "CURRENT_SELECTED_ELEMENT_PARENT_TABLE",
        REVISIT_PAGE_COUNT: "REVISIT_PAGE_COUNT",
        MAX_REVISIT_PAGE_COUNT: 3,
    },
    RECORDING_STATUS: {
        STATUS: "RECORDING_STATUS",
        NOT_RECORDING: "NOT_RECORDING",
        BEGAN_RECORDING: "BEGAN_RECORDING",
        RECORDING: "RECORDING",
        FINISHED_RECORDING: "FINISHED_RECORDING"
    },
    RECORDING_ID: {
        CURRENT_RECORDING_TUTORIAL_ID: "CURRENT_RECORDING_TUTORIAL_ID",
        CURRENT_RECORDING_TUTORIAL_STEP_INDEX: "CURRENT_RECORDING_TUTORIAL_STEP_INDEX",
    },
    FIRESTORE_CONSTANTS: {
        SIMPLE_TUTORIAL: "Simple Tutorials",
        SIMPLE_TUTORIAL_STEPS: "Steps",
        SIMPLE_TUTORIAL_ALL_URLS: "all_urls",
        STEP_INDEX: "index",
    },
    FIRESTORE_QUERY_TYPES: {
        ARRAY_CONTAINS: "array-contains",
        ARRAY_CONTAINS_ANY: "array-contains-any",
        IN: "in",
        NOT_IN: "not-in",
        NOT_EQUAL: "!=",
        GREATER_THAN_OR_EQUAL_TO: ">=",
        GREATER_THAN: ">",
        LESS_THAN: "<",
        LESS_THAN_OR_EQUAL_TO: "<=",
        EQUAL_TO: "=="
    },

    FOLLOWING_TUTORIAL_STATUS: {
        STATUS: "FOLLOWING_TUTORIAL_STATUS",
        IS_MANUALLY_FOLLOWING_TUTORIAL: "IS_MANUALLY_FOLLOWING_TUTORIAL",
        PAUSE_FOLLOWING_TUTORIAL: "PAUSE_FOLLOWING_TUTORIAL",
        IS_REQUIRING_OPTIONAL_INFO: "IS_REQUIRING_OPTIONAL_INFO",
        IS_REQUIRING_MANDATORY_INFO: "IS_REQUIRING_MANDATORY_INFO",
        IS_AUTO_FOLLOWING_TUTORIAL: "IS_AUTO_FOLLOWING_TUTORIAL",
        NOT_FOLLOWING_TUTORIAL: "NOT_FOLLOWING_TUTORIAL",
    },
    TUTORIAL_ID: {
        CURRENT_FOLLOWING_TUTORIAL_ID: "CURRENT_FOLLOWING_TUTORIAL_ID",
        CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID: "CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID",
    },
    STEP_ACTION_TYPE: {
        STEP_ACTION_TYPE_NULL: "STEP_ACTION_TYPE_NULL",
        STEP_ACTION_TYPE_REDIRECT: "STEP_ACTION_TYPE_REDIRECT",
        STEP_ACTION_TYPE_CLICK_REDIRECT: "STEP_ACTION_TYPE_CLICK_REDIRECT",
        STEP_ACTION_TYPE_CLICK: "STEP_ACTION_TYPE_CLICK",
        STEP_ACTION_TYPE_INPUT: "STEP_ACTION_TYPE_INPUT",
        STEP_ACTION_TYPE_SELECT: "STEP_ACTION_TYPE_SELECT",
        STEP_ACTION_TYPE_SIDE_INSTRUCTION: "STEP_ACTION_TYPE_SIDE_INSTRUCTION",
    }
}

//MARK: Utility functions
function syncStorageSet(key, value, callback = () => { }) {
    const data = {};
    data[key] = value
    chrome.storage.sync.set(data, callback);
    //console.log('syncStorageSet' + JSON.stringify(data));
}

function syncStorageSetBatch(data, callback = () => { }) {
    chrome.storage.sync.set(data, callback);
    //console.log('syncStorageSetBatch' + JSON.stringify(data));
}

function checkAndInitializeStorageIfUndefined(result, key, value) {
    if (!result) {
        alert(key)
        syncStorageSet(key, value)
    }
}

function intervalFromSpeed(speed) {
    if (speed < 50) {
        return 2600 - speed * 40;
    } else {
        return 600 - (speed - 50) * 10;
    }
}



/**
 * 
 * @param {*} element DOM element
 * @returns Path of element starting with "body" stored in a stack. Elements with id
 * attribute are stored as #id
 */
function getCompleteDomPathStack(element) {
    var stack = [];
    while (element.parentNode != null) {
        const index = $(element).index() + 1;
        stack.unshift(element.nodeName.toLowerCase() + ':nth-child(' + index + ')');
        element = element.parentNode;
    }
    return stack.slice(1); // removes the html element
}

function getShortDomPathStack(element) {
    var stack = [];
    while (element.parentNode != null) {
        const index = $(element).index() + 1;
        if (element.hasAttribute('id') && element.id !== '') {
            stack.unshift('#' + element.id);
            return stack;
        } else {
            stack.unshift(element.nodeName.toLowerCase() + ':nth-child(' + index + ')');
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
        jqueryString += currentElement;
        if (i == numberOfElement - 1) {
            break;
        }
        jqueryString += ' > '
    }
    return jqueryString
}

/**
 * Javascript implementation of the JQuery UI scrollParent() function.
 * @param {HTML Element} element 
 * @param {*} includeHidden 
 * @returns nearest scrollable container of the elemnt. If not find, return body
 */
function getScrollParent(element, includeHidden) {
    var style = getComputedStyle(element);
    var excludeStaticParent = style.position === "absolute";
    var overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;

    if (style.position === "fixed") return document.body;
    for (var parent = element; (parent = parent.parentElement);) {
        style = getComputedStyle(parent);
        if (excludeStaticParent && style.position === "static") {
            continue;
        }
        if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) return parent;
    }

    return document.body;
}

function sendMessageToContentScript(message, active = true, currentWindow = true) {
    chrome.tabs.query({ active, currentWindow }, function (tabs) {
        for (var i = 0; i < tabs.length; ++i) {
            chrome.tabs.sendMessage(tabs[i].id, message);
        }
    });
}


function makeElementDraggable(elmnt, target = elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        target.style.top = (target.offsetTop - pos2) + "px";
        target.style.left = (target.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

/**
 * Receives HTML element and returns HTML element
 */
function getNearestTableOrList(element) {
    const table = element.closest('table');
    if (isNotNull(table)) {
        return table;
    }
    const ul = element.closest('ul');
    if (isNotNull(ul)) {
        return ul;
    }
    const ol = element.closest('ol');
    if (isNotNull(ol)) {
        return ol;
    }
    return null;
}

function checkIfUrlMatch(urlToMatch, testingUrl) {
    if (urlToMatch[0] === '/') {
        const regex = new RegExp(urlToMatch.substr(1, urlToMatch.length - 2));
        return regex.test(testingUrl);
    } else {
        return urlToMatch === testingUrl;
    }
}

const LAYOUT_TYPE = {
    LEFT_DOWN: 0,
    LEFT_UP: 1,
    RIGHT_DOWN: 2,
    RIGHT_UP: 3,
    TOP_LEFT: 4,
    TOP_RIGHT: 5,
    BOTTOM_LEFT: 6,
    BOTTOM_RIGHT: 7,
    DEFAULT: 8,
};

function getInstructionWindowLayout(element) {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const boundingRect = element[0].getBoundingClientRect();
    const elementLeft = boundingRect.left;
    const elementTop = boundingRect.top;
    const leftMargin = elementLeft;
    const rightMargin = windowWidth - boundingRect.right;
    const topMargin = elementTop;
    const bottomMargin = windowHeight - boundingRect.bottom;
    const moreLeft = leftMargin > rightMargin;
    const moreTop = topMargin > bottomMargin;
    let layout = {
        type: LAYOUT_TYPE.DEFAULT,
        css: {
            top: '',
            bottom: '',
            right: '',
            left: '',
        },
    };

    //calculate layout
    if ((topMargin + bottomMargin) > 100) {
        if (moreTop) {
            if (moreLeft) {
                layout.type = LAYOUT_TYPE.TOP_LEFT;
                layout.css.bottom = windowHeight - topMargin;
                layout.css.right = rightMargin;
                console.log(boundingRect)
            }
            else {
                layout.type = LAYOUT_TYPE.TOP_RIGHT;
                layout.css.bottom = windowHeight - topMargin;
                layout.css.left = leftMargin;
            }
        } else {
            if (moreLeft) {
                layout.type = LAYOUT_TYPE.BOTTOM_LEFT;
                layout.css.top = windowHeight - bottomMargin + 4;
                layout.css.right = rightMargin;
            }
            else {
                layout.type = LAYOUT_TYPE.BOTTOM_RIGHT;
                layout.css.top = windowHeight - bottomMargin + 4;
                layout.css.left = leftMargin;
            }
        }
    } else {
        //use left or right margin
        if ((leftMargin + rightMargin) > 100) {
            if (moreTop) {
                if (moreLeft) {
                    layout.type = LAYOUT_TYPE.LEFT_UP;
                    layout.css.bottom = windowHeight - topMargin;
                    layout.css.right = rightMargin;
                }
                else {
                    layout.type = LAYOUT_TYPE.RIGHT_UP;
                    layout.css.bottom = windowHeight - topMargin;
                    layout.css.right = rightMargin;
                }
            } else {
                if (moreLeft) {
                    layout.type = LAYOUT_TYPE.LEFT_DOWN;
                    layout.css.bottom = windowHeight - topMargin;
                    layout.css.right = rightMargin;
                }
                else {
                    layout.type = LAYOUT_TYPE.RIGHT_DOWN;
                    layout.css.bottom = windowHeight - topMargin;
                    layout.css.right = rightMargin;
                }
            }
        } else {
            console.log("NOT enough margin")
        }
    }

    return layout;
}

function movePopupIfOverlap() {
    const mainPopupRect = mainPopUpContainer[0].getBoundingClientRect();
    const instructionWindow = highlightInstructionWindow[0].getBoundingClientRect();
    const overlap = !(mainPopupRect.right < instructionWindow.left ||
        mainPopupRect.left > instructionWindow.right ||
        mainPopupRect.bottom < instructionWindow.top ||
        mainPopupRect.top > instructionWindow.bottom)

    if (overlap) {
        simulateClick(mainCloseButton[0]);
    }
}




//MARK: Library functions
function isNotNull(obj) {
    return (obj !== null && typeof obj !== 'undefined');
}

function isEmpty(str) {
    return (!str || str.length === 0);
}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (var i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

/**
 * @returns true if b is subarray of a
 */
function isSubArray(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;

    for (var i = 0; i < b.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

/**
 * true if a contains b
 */
function arrayContains(a, b) {
    var contains = true;
    b.forEach((val) => { if (!a.includes(val)) contains = false; });
    return contains;
}

function min(a, b) {
    return a > b ? b : a;
}

function max(a, b) {
    return a > b ? a : b;
}