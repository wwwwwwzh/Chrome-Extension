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
        'width': '100px',
        'height': '100px',
        'padding': '12px',
        'background-color': 'orange',
        'border-radius': '12px',
        'z-index': 2147483647
    }
}

const VALUES = {
    STORAGE: {
        IS_RECORDING_TUTORIAL: 'IS_RECORDING_TUTORIAL',
        IS_RECORDING_ACTIONS: 'IS_RECORDING_ACTIONS',
        CURRENT_URL: "CURRENT_URL",
        UNSENT_DOM_PATH: "UNSENT_DOM_PATH",
        UNSENT_DOM_PATH_URL: "UNSENT_DOM_PATH_URL",
        DESCRIPTION_FOR_NEXT_STEP: "DESCRIPTION_FOR_NEXT_STEP",
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
        STEP_ACTION_TYPE: "action_type",
        STEP_ACTION_REDIRECT_TO: "redirect_to",
        STEP_ACTION_INPUT: "input",
        STEP_DESCRIPTION: "description",
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
        BEGAN_FOLLOWING_TUTORIAL: "BEGAN_FOLLOWING_TUTORIAL",
        PAUSE_FOLLOWING_TUTORIAL: "PAUSE_FOLLOWING_TUTORIAL",
        AUTO_FOLLOWING_TUTORIAL: "AUTO_FOLLOWING_TUTORIAL",
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

function checkAndInitializeStorageIfUndefined(result, key, value) {
    if (!result) {
        alert(key)
        syncStorageSet(key, value)
    }
}