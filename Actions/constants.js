const firebaseConfig = {
    apiKey: "AIzaSyD2iKakYgBqJ2T6CVQpzHZIjzJW8k0JQTo",
    authDomain: "test-e7bb0.firebaseapp.com",
    projectId: "test-e7bb0",
    storageBucket: "test-e7bb0.appspot.com",
    messagingSenderId: "84428320764",
    appId: "1:84428320764:web:26669d7f6e21cae5650c79",
    measurementId: "G-LM6FVJF8S6"
}

const CSS = {
    HIGHLIGHT_BOX: {
        'box-shadow': '0 0 20px rgba(255, 203, 42, 1)',
        'padding': '3px',
        'border': '2px solid rgba(246, 131, 11, 0.5)',
        'border-radius': '5px'
    },
    MAIN_OPTIONS_POPUP: {
        "position": "fixed",
        "top": '12px',
        "left": '12px',
        'width': '200px',
        'height': '300px',
        'padding': '12px',
        'background-color': 'orange',
        'border-radius': '12px',
        'z-index': 2147483647
    },
    AUTOMATION_SPEED_SLIDER: {
        "-webkit-appearance": "none",
        "width": "100%",
        "height": "25px",
        "background": "#d3d3d3",
        "outline": "none",
        "opacity": "0.7",
        "-webkit-transition": ".2s",
        "transition": "opacity .2s",
    },
    MAIN_MIDDLE_POPUP: {
        'position': 'fixed',
        'top': '50%',
        'left': '50%',
        'transform': 'translate(-50%, -50%)',
        'width': '200px',
        'height': '200px',
        'padding': '12px',
        'background-color': 'orange',
        'border-radius': '12px',
        'z-index': 2147483647
    },
    MAIN_OPTIONS_POPUP_SIMPLE_TUTORIAL_BUTTON: {
        "box-shadow": "inset 0px 0px 0px 0px #cf866c",
        "background": "linear-gradient(to bottom, #d0451b 5%, #bc3315 100%)",
        "background-color": "#d0451b",
        "border-radius": "6px",
        "border": "1px solid #942911",
        "display": "inline-block",
        "cursor": "pointer",
        "color": "#ffffff",
        "font-family": "Arial",
        "font-size": "13px",
        "padding": "14px 24px",
        "text-decoration": "none",
        "text-shadow": "0px 1px 0px #854629",
    },
    MAIN_STOP_OPTIONS_CONTAINER: {
        "position": "fixed",
        "top": '12px',
        "left": '12px',
        'width': '200px',
        'height': '300px',
        'padding': '12px',
        'background-color': 'orange',
        'border-radius': '12px',
        'z-index': 2147483647
    }
}

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
    }
}


function syncStorageSet(key, value, callback) {
    const data = {}
    data[key] = value
    chrome.storage.sync.set(data, () => {
        if (callback) { callback(); }
    });

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

function isSubArray(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;

    const shorterLength = a.length > b.length ? b.length : a.length;
    for (var i = 0; i < shorterLength; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function checkAndInitializeStorageIfUndefined(result, key, value) {
    if (!result) {
        alert(key)
        syncStorageSet(key, value)
    }
}

function intervalFromSpeed(speed) {
    if (speed < 50) {
        return 5500 - speed * 70;
    } else {
        return 2000 - (speed - 50) * 30;
    }
}

function min(a, b) {
    return a > b ? b : a;
}

function tooglePointerEvent() {
    chrome.storage.sync.get([VALUES.STORAGE.STEP_ACTION_TYPE], result => {

    })
    $('body').css('pointer-events', 'none')
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

function isNotNull(obj) {
    return (obj !== null && typeof obj !== 'undefined');
}

function popupSendMessage(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message);
    });
}