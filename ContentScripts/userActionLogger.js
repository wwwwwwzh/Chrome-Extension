class UserActionLogger {
    static ACTION_TYPE = {
        RECORDING: {
            SWITCH_TO_EDIT_TUTORIAL: 'SWITCH_TO_EDIT_TUTORIAL',
            SWITCH_TO_EDIT_STEP: 'SWITCH_TO_EDIT_STEP',
            TUTORIAL_NAME_FOCUS_OUT: 'TUTORIAL_NAME_FOCUS_OUT',
            TUTORIAL_DESCRIPTION_FOCUS_OUT: 'TUTORIAL_DESCRIPTION_FOCUS_OUT',
            STEP_NAME_FOCUS_OUT: 'STEP_NAME_FOCUS_OUT',
            STEP_DESCRIPTION_FOCUS_OUT: 'STEP_DESCRIPTION_FOCUS_OUT',
            STEP_TYPE_FOCUS_OUT: 'STEP_TYPE_FOCUS_OUT',

            CLICK_MORE_OPTION: 'CLICK_MORE_OPTION',
            STEP_OPTION_NAME_FOCUS_OUT: 'STEP_OPTION_NAME_FOCUS_OUT',
            STEP_OPTION_DESCRIPTION_FOCUS_OUT: 'STEP_OPTION_DESCRIPTION_FOCUS_OUT',
            STEP_OPTION_URL_FOCUS_OUT: 'STEP_OPTION_URL_FOCUS_OUT',
            STEP_OPTION_INPUT_FOCUS_OUT: 'STEP_OPTION_INPUT_FOCUS_OUT',
            STEP_REDIRECT_URL_FOCUS_OUT: 'STEP_REDIRECT_URL_FOCUS_OUT',
            ADD_STEP_OPTION: 'ADD_STEP_OPTION',
            DELETE_STEP_OPTION: 'DELETE_STEP_OPTION',
            CLICK_HIGHLIGHT: 'CLICK_HIGHLIGHT',
            HIGHLIGHT: 'HIGHLIGHT',

            DRAG_PANEL_BEGIN: 'DRAG_PANEL_BEGIN',
            DRAG_PANEL_STOP: 'DRAG_PANEL_STOP',
            ADD_STEP: 'ADD_STEP',
            DISCARD: 'DISCARD',
            FINISH: 'FINISH',
        },
        FOLLOWING: {
            CLICK: 'CLICK'
        }
    }

    static cache = []

    static #lastTimestamp = 0
    static #currentTimestampStackStartTimestamp = 0
    static #totalClickCount = 0
    static #correctClickCount = 0
    static #followingInteractive = true
    


    static log(type, blob, callback = () => { }) {
        if (!((DEBUG_OPTION && VALUES.DEBUG_MASKS.DEBUG_LOGGING) || (DEBUG_OPTION && VALUES.DEBUG_MASKS.PRODUCTION_LOGGING))) return
        UserActionLogger.cache.push({
            timestamp: Date.now().toString(),
            url: window.location.href,
            targetClick: isFollowingOtherTutorial() ? 'null' : ClickAction.getDefaultClick(TutorialsModel.getLastStep().actionObject).path,
            type,
            ...blob,
        })
        if (type == UserActionLogger.ACTION_TYPE.FOLLOWING.CLICK) {
            UserActionLogger.#totalClickCount+=1;
        }
        if (UserActionLogger.cache.length > 5) {
            //var sessionId = generateRandomNumber();
            UserActionLogger.#uploadToFirebase(() => {
                UserActionLogger.cache = []
                callback()
            })
        } else {
            callback()
        }
    }

    static async #uploadToFirebase(location=doc('timestamp'), callback = () => { }) {
        // VALUES.FIRESTORE_CONSTANTS.USER_LOG_ALL_SESSIONS, 0, VALUES.FIRESTORE_CONSTANTS.USER_LOG_DETAIL, timestamp
        // TODO: get different kind of data by define an extra variable called location
        
        UserActionLogger.getMacId(async id => {
            const batch = writeBatch(ExtensionController.SHARED_FIRESTORE_REF);

            UserActionLogger.cache.forEach((action, index) => {
                var { timestamp, ...modifiedAction } = action
                const intervalSinceLastAction = timestamp - UserActionLogger.#lastTimestamp
                if (intervalSinceLastAction > 10000) {
                    modifiedAction.timeLapse = 0
                    UserActionLogger.#currentTimestampStackStartTimestamp = timestamp
                } else {
                    modifiedAction.timeLapse = (timestamp - UserActionLogger.#currentTimestampStackStartTimestamp) / 1000
                }
                UserActionLogger.#lastTimestamp = timestamp
                var date = new Date();
                modifiedAction.date = date.toLocaleString();
                // modifiedAction.url = window.location.href;
                // modifiedAction.targetClick = ClickAction.getDefaultClick(TutorialsModel.getCurrentStep().actionObject).path;
                batch.set(doc(ExtensionController.SHARED_FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.USER_LOG, id, VALUES.FIRESTORE_CONSTANTS.USER_LOG_ALL_SESSIONS, "0", VALUES.FIRESTORE_CONSTANTS.USER_LOG_DETAILS, timestamp), modifiedAction);
                batch.set(doc(ExtensionController.SHARED_FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.USER_LOG, id, VALUES.FIRESTORE_CONSTANTS.USER_LOG_ALL_SESSIONS, "0", VALUES.FIRESTORE_CONSTANTS.USER_LOG_EFFICIENCY, "Time Used"), {time: modifiedAction.timeLapse});
                batch.set(doc(ExtensionController.SHARED_FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.USER_LOG, id, VALUES.FIRESTORE_CONSTANTS.USER_LOG_ALL_SESSIONS, "0", VALUES.FIRESTORE_CONSTANTS.USER_LOG_EFFICIENCY, "Interactive or not"), {boolean: UserActionLogger.#followingInteractive});
                batch.set(doc(ExtensionController.SHARED_FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.USER_LOG, id, VALUES.FIRESTORE_CONSTANTS.USER_LOG_ALL_SESSIONS, "0", VALUES.FIRESTORE_CONSTANTS.USER_LOG_EFFICIENCY, "Total clicks"), {click: UserActionLogger.#totalClickCount});
            })
            await batch.commit();
            callback()
        })
    }

    static getMacId(callback) {
        hugeStorageGetMultiple('macid', result => {
            var id = result['macid'];
            if (!id) {
                const newId = Math.random().toString(36).slice(2);
                syncStorageSet('macid', newId)
                id = newId
            }
            callback(id)
        });


    }

    static onStartFollowing() {

    }

    static onEndFollowing() {

    }
}