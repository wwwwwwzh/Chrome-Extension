function c(...data) {
    console.log(...data)
}

function t() {
    console.trace()
}

function logAndTrace(...data) {
    c(...data)
    t()
}

const firebaseConfig = {
    apiKey: "AIzaSyD2iKakYgBqJ2T6CVQpzHZIjzJW8k0JQTo",
    authDomain: "test-e7bb0.firebaseapp.com",
    projectId: "test-e7bb0",
    storageBucket: "test-e7bb0.appspot.com",
    messagingSenderId: "84428320764",
    appId: "1:84428320764:web:26669d7f6e21cae5650c79",
    measurementId: "G-LM6FVJF8S6"
}


const VALUES = {
    INPUT_TYPES: {
        TEXT: "INPUT_TYPES_TEXT",
        URL: "INPUT_TYPES_URL",

    },
    STORAGE: {
        CURRENT_RECORDING_TUTORIAL_NAME: 'CURRENT_RECORDING_TUTORIAL_NAME',

        CURRENT_URL: "CURRENT_URL",
        UNSENT_DOM_PATH: "UNSENT_DOM_PATH",
        UNSENT_DOM_PATH_URL: "UNSENT_DOM_PATH_URL",
        //DESCRIPTION_FOR_NEXT_STEP: "DESCRIPTION_FOR_NEXT_STEP",
        STEP_ACTION_TYPE: "STEP_ACTION_TYPE",
        //STEP_ACTION_INPUT_VALUE: "STEP_ACTION_INPUT_VALUE",
        // CURRENT_STEP_OBJ: "CURRENT_STEP_OBJ",
        CURRENT_SELECTED_ELEMENT: "CURRENT_SELECTED_ELEMENT",
        CURRENT_SELECTED_ELEMENT_PARENT_TABLE: "CURRENT_SELECTED_ELEMENT_PARENT_TABLE",
        REVISIT_PAGE_COUNT: "REVISIT_PAGE_COUNT",
        MAX_REVISIT_PAGE_COUNT: 3,

        CURRENT_ACTIVE_TUTORIAL: 'CURRENT_ACTIVE_TUTORIAL',
        ALL_OTHER_TUTORIALS: 'ALL_OTHER_TUTORIALS',

    },
    // RECORDING_STATUS: {
    //     STATUS: "RECORDING_STATUS",
    //     NOT_RECORDING: "NOT_RECORDING",
    //     BEGAN_RECORDING: "BEGAN_RECORDING",
    //     RECORDING: "RECORDING",
    //     FINISHED_RECORDING: "FINISHED_RECORDING"
    // },
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

    TUTORIAL_STATUS: {
        STATUS: "FOLLOWING_TUTORIAL_STATUS",
        IS_RECORDING: 2,
        IS_CREATING_NEW_TUTORIAL: 20,
        IS_MANUALLY_FOLLOWING_TUTORIAL: 3,
        IS_PAUSING_FOLLOWING_TUTORIAL: 8,
        IS_REQUIRING_OPTIONAL_INFO: 9,
        IS_REQUIRING_MANDATORY_INFO: 10,
        IS_AUTO_FOLLOWING_TUTORIAL: 4,
        STOPPED_FROM_OTHER_PAGE: 5,
        LOADED: 1,
        BEFORE_INIT_NULL: 0
    },
    STEP_ACTION_TYPE: {
        STEP_ACTION_TYPE_NULL: 0,
        STEP_ACTION_TYPE_CLICK: 1,
        STEP_ACTION_TYPE_CLICK_REDIRECT: 2,
        STEP_ACTION_TYPE_REDIRECT: 3,
        STEP_ACTION_TYPE_INPUT: 4,
        STEP_ACTION_TYPE_SIDE_INSTRUCTION: 5,
        STEP_ACTION_TYPE_SELECT: 6,
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

function simulateClick(element, eventType = 'click') {
    if (isNotNull(element)) {
        console.log(`simulating click on ${element}`)
        const evt = new MouseEvent(eventType, {
            view: window,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(evt);
    } else {
        console.log('simulateClick: element not found')
    }
    console.trace();
}

function getElementIndexInParent(element) {
    return Array.from(element.parentNode.children).indexOf(element);
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
        const index = getElementIndexInParent(element) + 1;
        stack.unshift(element.nodeName.toLowerCase() + ':nth-child(' + index + ')');
        element = element.parentNode;
    }
    return stack.slice(1); // removes the html element
}

function getShortDomPathStack(element) {
    var stack = [];
    while (element.parentNode != null) {
        const index = getElementIndexInParent(element) + 1;
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

function jQueryinsertAt(parent, index, child) {
    var lastIndex = parent.children().length;
    if (index < 0) {
        index = Math.max(0, lastIndex + 1 + index);
    }
    parent.append(child);
    if (index < lastIndex) {
        parent.children().eq(index).before(parent.children().last());
    }
}
/**
 * 
 * @param {*} shouldSelect jQuery element
 * @param {*} isSelecting jQuery element. Will automaticaclly select the first
 * @returns 
 */
function isSelectedOnRightElement(isSelectingPath, shouldSelectPath) {
    var isSelecting = isSelectingPath; //jQuery single element
    var shouldSelect = shouldSelectPath; //jQuery object from selector
    var type = SELECTOR_TYPES.EXACT;
    for (let i = 0; i < shouldSelectPath.length; i++) {
        if (shouldSelectPath[i].includes('=')) {
            // regex selector
            isSelecting = $(jqueryElementStringFromDomPath(isSelectingPath)).get(0);
            shouldSelect = $(jqueryElementStringFromDomPath(shouldSelectPath));
            type = SELECTOR_TYPES.REGEX;
        }
    }
    var isSelectedOnRightElement = false;
    switch (type) {
        case SELECTOR_TYPES.EXACT:
            isSelectedOnRightElement = isSubArray(isSelecting, shouldSelect);
            break;
        case SELECTOR_TYPES.REGEX:
            shouldSelect.each((index, element) => {
                if (element.isSameNode(isSelecting)) {
                    isSelectedOnRightElement = true;
                }
            })
            break;
        default:
            break;
    }

    return isSelectedOnRightElement;
}

const SELECTOR_TYPES = {
    EXACT: '0',
    REGEX: '1',
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
    var dragOffsetX = 0
    var dragOffsetY = 0
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e.preventDefault();
        const element = e.target
        dragOffsetY = e.y - element.getBoundingClientRect().top
        dragOffsetX = e.x - element.getBoundingClientRect().left
        // get the mouse cursor position at startup:
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        // calculate the new cursor position:
        target.style.top = `${e.y - dragOffsetY}px`
        target.style.left = `${e.x - dragOffsetX}px`
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
    // c('urlToMatch:' + urlToMatch + 'testingUrl:' + testingUrl)
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

//TODO: move to specific controller
function movePopupIfOverlap(popup, highlightInstructionWindow) {
    const mainPopupRect = popup[0].getBoundingClientRect();
    const instructionWindow = highlightInstructionWindow[0].getBoundingClientRect();
    const overlap = !(mainPopupRect.right < instructionWindow.left ||
        mainPopupRect.left > instructionWindow.right ||
        mainPopupRect.bottom < instructionWindow.top ||
        mainPopupRect.top > instructionWindow.bottom)

    if (overlap) {
        //TODO: 
        //mainPopUpContainer.css({})
    }
}




//MARK: Library functions
function isNotNull(obj) {
    return (obj !== null && typeof obj !== 'undefined');
}

function isStringEmpty(str) {
    return (!str || str.length === 0);
}

function isArrayEmpty(arr) {
    return (!isNotNull(arr) || arr?.length === 0)
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

function arrayRemoveFirst(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}

function arrayRemoveAll(arr, value) {
    var i = 0;
    while (i < arr.length) {
        if (arr[i] === value) {
            arr.splice(i, 1);
        } else {
            ++i;
        }
    }
    return arr;
}

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}