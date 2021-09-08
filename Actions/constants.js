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
    }
}

const VALUES = {
    STORAGE: {
        IS_RECORDING_TUTORIAL: 'IS_RECORDING_TUTORIAL',
        IS_RECORDING_ACTIONS: 'IS_RECORDING_ACTIONS'
    },
    RECORDING_STATUS: {
        STATUS: "RECORDING_STATUS",
        NOT_RECORDING: "NOT_RECORDING",
        BEGAN_RECORDING: "BEGAN_RECORDING",
        RECORDING: "RECORDING",
        FINISHED_RECORDING: "FINISHED_RECORDING"
    },
    RECORDING_ID: {
        CURRENT_TUTORIAL_ID: "CURRENT_TUTORIAL_ID"
    },
    COLLECTION_NAMES: {
        SIMPLE_TUTORIAL: "Simple Tutorials",
        SIMPLE_TUTORIAL_STEPS: "Steps"
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
    }
}


function syncStorageSet(key, value) {
    const data = {}
    data[key] = value
    chrome.storage.sync.set(data);
}

function isEmpty(str) {
    return (!str || str.length === 0);
}
