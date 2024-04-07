class TutorialsModel {
    //Constants
    static LAST_SAVED_TIMESTAMP_KEY = 'LSTK'
    static URL_ASSOCIATED_WITH_CURRENT_TUTORIAL_QUERY_SNAPSHOT_KEY = 'UAWCTQS'

    //local variables
    static #tutorials = []
    static #tutorialsQuerySnapshot
    static #tutorialList = [] //A list of ID from url

    static #automationControlObject = { automationChoices: [] }
    /**
     * 
     */
    static tutorialsModelFollowingTutorialDelegate

    //getter methods
    static getCurrentTutorial() {
        return TutorialsModel.#tutorials[0];
    }

    static getCurrentStep() {
        const currentTutorial = TutorialsModel.getCurrentTutorial();
        return currentTutorial?.steps[currentTutorial.currentStepIndex];
    }

    static getLastStep() {
        const currentTutorial = TutorialsModel.getCurrentTutorial();
        return currentTutorial?.steps[currentTutorial.currentStepIndex-1];
    }


    static getCurrentStepIndex() {
        return TutorialsModel.getCurrentTutorial()?.currentStepIndex;
    }

    static getLastStepIndexForTutorial(tutorialIndex = 0) {
        return TutorialsModel.#tutorials[tutorialIndex].steps.length - 1;
    }

    static forEachTutorial(fn) {
        this.#tutorials.forEach((tutorial, index) => {
            fn(tutorial, index)
        })
    }

    static getTutorialAtIndex(index) {
        return TutorialsModel.#tutorials[index];
    }

    static getFirstStepOfTutorialAtIndex(index) {
        return TutorialsModel.#tutorials[index].steps[0]
    }

    static getStepOfTutorialAtIndex(tutorialIndex, stepIndex) {
        return TutorialsModel.#tutorials[tutorialIndex].steps[stepIndex]
    }

    static getStepOfCurrentTutorialAtIndex(index) {
        return TutorialsModel.#tutorials[0].steps[index]
    }

    //initialization methods

    /**
     * 
     * @returns True if the current tutorial model's current step url matches user's url
     */
    static checkIfCurrentURLMatchesPageURL() {
        const currentURL = TutorialsModel.getCurrentStep()?.url;
        console.log(this.getCurrentTutorial() + " current")
        console.log(globalCache.currentURL + " cache")
        return isNotNull(currentURL) && checkIfUrlMatch(currentURL, globalCache.currentUrl)
    }

    // static #getMatchedTutorialsQuery() {
    //     const domainName = "https://" + globalCache.currentURLObj.hostname + "/";
    //     const regexName = regexFromUrl(globalCache.currentUrl)
    //     const url_matches = [globalCache.currentUrl, regexName];
    //     console.log(url_matches)
    //     return query(collection(ExtensionController.SHARED_FIRESTORE_REF,
    //         VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL),
    //         where(
    //             VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL_ALL_URLS,
    //             VALUES.FIRESTORE_QUERY_TYPES.ARRAY_CONTAINS_ANY,
    //             url_matches
    //         )
    //     ); 
    // }

    static async #getMatchedTutorialsList() {
        const regexName = numRegexUrl([window.location.href])
        var UrlTutorialList = [];

        const strArray = globalCache.currentUrl.split("/");
        var urlString = strArray[2]; //Get the "absolute" address
        var hostName = "";

        const urlQuery = await getDocs(collection(ExtensionController.SHARED_FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.URL));
        urlQuery.forEach((docUrl) => {
            if (docUrl.id == urlString) {
                hostName = docUrl.id;
                return;
            }
        })

        if (hostName == "") {
            return UrlTutorialList;
        } //No tut found, return!

        var allIdFromCurrentHost = [];
        const idQuery = await getDocs(collection(ExtensionController.SHARED_FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.URL, hostName, VALUES.FIRESTORE_CONSTANTS.URL_ALLURL))
        idQuery.forEach((idUrl) => {
            allIdFromCurrentHost.push(idUrl.id);
        })

        for (var i = 0; i < allIdFromCurrentHost.length; i++) {
            const docSnap = await getDoc(doc(ExtensionController.SHARED_FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.URL, hostName, VALUES.FIRESTORE_CONSTANTS.URL_ALLURL, allIdFromCurrentHost[i]));
            for (var j = 0; j < docSnap.data().regexUrl.length; j++) {
                if (regexName[0] === docSnap.data().regexUrl[j]) {
                    UrlTutorialList.push(allIdFromCurrentHost[i]);
                }
            }
        }

        // console.log("Url: " + UrlTutorialList + "   " + UrlTutorialList.length)
        // TutorialsModel.#tutorialsQuerySnapshot = await getDocs(query(collection(ExtensionController.SHARED_FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL), where(documentId(), VALUES.FIRESTORE_QUERY_TYPES.IN, UrlTutorialList)));
        // TutorialsModel.#tutorialsQuerySnapshot.forEach((doc) => {
        //     console.log(doc.id);
        //   });

        return UrlTutorialList;
        // return list from "Url", containing all URL after using regex.
    }

    // static async checkIfAnyTutorialExistsOnPage(callBackWhenExists, callbackWhenNot = () => { }) {
    //     TutorialsModel.#getTutorialsQuerySnapshotFromFirestore(() => {
    //         TutorialsModel.#tutorialsQuerySnapshot.empty ? callbackWhenNot() : callBackWhenExists() //这里的snapshot换成下面方法的新变量
    //     })
    // }

    // /**
    //  * This will fetch all tutorials on page to local private variable tutorialsQuerySnapshot
    //  */
    // static async #getTutorialsQuerySnapshotFromFirestore(callback = () => { }) {
    //     TutorialsModel.#tutorialsQuerySnapshot = await getDocs(TutorialsModel.#getMatchedTutorialsQuery()); //把list给新建的variable tutorialsQuerySnapshot替换掉
    //     callback()
    // }

    static async checkIfAnyTutorialExistsOnPage(callBackWhenExists, callbackWhenNot = () => { }) {
        TutorialsModel.#StoreTutorialList(() => {
            TutorialsModel.#tutorialList.length == 0 ? callbackWhenNot() : callBackWhenExists();
        })
    }

    static async #StoreTutorialList(callback = () => { }) {
        TutorialsModel.#tutorialList = await TutorialsModel.#getMatchedTutorialsList();
        callback();
    }

    /**
     * reload if pass 60000s or url changed. noReloadFunc if following tutorial. 
     * @param {*} reloadFunc 
     * @param {*} noReloadFunc 
     * @returns 
     */
    static #checkIfReloadFromCloudIsNeeded(reloadFunc = () => { }, noReloadFunc = () => { }) {
        if (isManualFollowingTutorial() ||
            isAutoFollowingTutorial()) {
            noReloadFunc()
            return
        }

        hugeStorageGetMultiple([TutorialsModel.LAST_SAVED_TIMESTAMP_KEY, TutorialsModel.URL_ASSOCIATED_WITH_CURRENT_TUTORIAL_QUERY_SNAPSHOT_KEY], (result) => {
            const lastSavedTimestamp = result[TutorialsModel.LAST_SAVED_TIMESTAMP_KEY]
            const urlAssociatedWithCurrentTutorialsQuerySnapshot = result[TutorialsModel.URL_ASSOCIATED_WITH_CURRENT_TUTORIAL_QUERY_SNAPSHOT_KEY]
            const isPassedReloadTime = (((Date.now() / 60000 | 0) - (lastSavedTimestamp / 60000 | 0)) > 1)
            // c('last' + urlAssociatedWithCurrentTutorialsQuerySnapshot + '   |now:' + globalCache.currentUrl)
            const isReload = urlAssociatedWithCurrentTutorialsQuerySnapshot !== globalCache.currentUrl || isPassedReloadTime
            if (isReload) {
                var data = {}
                data[TutorialsModel.LAST_SAVED_TIMESTAMP_KEY] = Date.now()
                data[TutorialsModel.URL_ASSOCIATED_WITH_CURRENT_TUTORIAL_QUERY_SNAPSHOT_KEY] = globalCache.currentUrl
                syncStorageSetBatch(data)
                reloadFunc()
            } else {
                noReloadFunc()
            }
        })
    }

    static isLoadingFromCloud = false;

    /**
     * Load new query from firestore and initialize model.
     * Should be used when forcing a new firestore query.
     * smartInit is preferred
     * @param {*} callback 
     */
    static async #initializeFromFirestore(callback = () => { }) {
        await TutorialsModel.#StoreTutorialList()
        TutorialsModel.#tutorials = [];
        await TutorialsModel.#loadFromQuerySnapshot(callback)
    }

    static async #loadFromQuerySnapshot(callback = () => { }) {
        if (TutorialsModel.#tutorialList.length == 0) {
            TutorialsModel.#tutorialList = ['h0vvj']
        }
        TutorialsModel.#tutorialsQuerySnapshot = await getDocs(query(collection(ExtensionController.SHARED_FIRESTORE_REF, VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL), where(documentId(), VALUES.FIRESTORE_QUERY_TYPES.IN, TutorialsModel.#tutorialList)));
        //transfer new variable "TutorialList" into "tutorialQuerySnapShot"
        TutorialsModel.isLoadingFromCloud = true;
        await Promise.all(TutorialsModel.#tutorialsQuerySnapshot.docs.map(async (tutorial) => {
            const tutorialID = tutorial.id;
            const tutorialData = tutorial.data();

            //get all information about the tutorial from firebase
            const stepsQuery = query(collection(ExtensionController.SHARED_FIRESTORE_REF,
                VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL,
                tutorialID,
                VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL_STEPS
            ), orderBy(VALUES.FIRESTORE_CONSTANTS.STEP_INDEX));
            const stepsQuerySnapshot = await getDocs(stepsQuery);
            //construct steps array from query
            var steps = [];
            //TODO!: solve url problem (possibly using regex)
            var isFirstStepReached = false;
            stepsQuerySnapshot.forEach((step, index) => {
                const data = step.data();
                data.id = step.id;
                data.getPath = Step.prototype.getPath
                //remove steps used prior to accessing this page
                if (isFirstStepReached) {
                    steps.push(data);
                } else {
                    if (checkIfUrlMatch(data.url, globalCache.currentUrl)) {
                        isFirstStepReached = true;
                        steps.push(data);
                    }
                }
            })

            const tutorialObj = new TutorialObject(tutorialData.name, '', [], steps, tutorialData.all_urls, tutorialID)
            TutorialsModel.#tutorials.push(tutorialObj);
        }));
        TutorialsModel.saveToStorage(() => {
            callback()
            TutorialsModel.#onTutorialFinishedLoading();
        });
    }

    static async smartInit(callback) {
        TutorialsModel.#checkIfReloadFromCloudIsNeeded(() => {
            c('reloading from cloud')
            if (UserEventListnerHandler.tutorialStatusCache === VALUES.TUTORIAL_STATUS.IS_RECORDING ||
                UserEventListnerHandler.tutorialStatusCache === VALUES.TUTORIAL_STATUS.IS_CREATING_NEW_TUTORIAL) {
                hugeStorageGetMultiple([VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL], async (result) => {
                    const currentTutorial = result[VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL];
                    
                    TutorialsModel.#initializeFromFirestore(() => {
                        TutorialsModel.#tutorials.unshift(currentTutorial)
                        TutorialsModel.saveToStorage(callback);
                    })
                });
            } else {
                TutorialsModel.#initializeFromFirestore(callback)
            }
        }, () => {
            hugeStorageGetMultiple([VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL, VALUES.STORAGE.ALL_OTHER_TUTORIALS, "ACO"], async (result) => {
                const currentTutorial = result[VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL];
                if (isNotNull(currentTutorial)) {
                    const allOtherTutorials = result[VALUES.STORAGE.ALL_OTHER_TUTORIALS];
                    TutorialsModel.#tutorials = [currentTutorial]
                    isNotNull(allOtherTutorials) && !isArrayEmpty(allOtherTutorials) && TutorialsModel.#tutorials.push(...allOtherTutorials)
                    console.log('loading ' + TutorialsModel.#tutorials.length + ' tutorials from storage')
                    //c(currentTutorial.currentStepIndex)
                    TutorialsModel.#automationControlObject = result['ACO']
                    callback();
                } else {
                    console.trace()
                    console.log('loadFromQuerySnapshot')
                    TutorialsModel.#loadFromQuerySnapshot(callback)
                }
            });
        })
    }

    static updateAutomationControlObject(aco) {
        TutorialsModel.#automationControlObject = aco
    }

    static getAutomationControlObject() {
        return TutorialsModel.#automationControlObject
    }

    /**
     * Save all tutorials to chrome.storage.sync
     */
    static saveToStorage(callback = () => { }) {
        
        syncStorageSetBatch({
            [VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL]: TutorialsModel.#tutorials[0],
            [VALUES.STORAGE.ALL_OTHER_TUTORIALS]: TutorialsModel.#tutorials.slice(1),
        }, ()=>{
            console.log('saved ' + TutorialsModel.#tutorials.length + ' tutorials to storage')
            callback()
            hugeStorageGetMultiple([VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL, VALUES.STORAGE.ALL_OTHER_TUTORIALS, "ACO"], async (result) => {
                const currentTutorial = result[VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL];
                const allOther = result[VALUES.STORAGE.ALL_OTHER_TUTORIALS];
                c('saved currentTutorial: '+currentTutorial)
                c('saved all other: '+allOther)
                })
        });
    }

    /**
     * Save current active tutorial to storage
     */
    static saveActiveTutorialToStorage(callback = () => { }) {
        console.log('saving active tutorial to storage' + TutorialsModel.#tutorials[0])
        syncStorageSet([VALUES.STORAGE.CURRENT_ACTIVE_TUTORIAL], TutorialsModel.#tutorials[0], callback);
    }

    static getFirstStepIndexOnCurrentPage() {
        return TutorialsModel.getNthStepIndexOnCurrentPage(0)
    }

    static getNthStepIndexOnCurrentPage(n) {
        var nthStepIndexOnCurrentPage = -1;
        var currentMatchingStepIndexOnCurrentPage = -1;
        TutorialsModel.#tutorials[0].steps.some((step, index) => {
            if (checkIfUrlMatch(step.url, globalCache.currentUrl)) {
                currentMatchingStepIndexOnCurrentPage++;
                if (currentMatchingStepIndexOnCurrentPage === n) {
                    nthStepIndexOnCurrentPage = index;
                    return true;
                }
            }
        });
        return nthStepIndexOnCurrentPage;
    }

    //------------------------------------------------------------------------------------------
    //recording functions
    //------------------------------------------------------------------------------------------

    /**
     * Create new tutorial object and insert at front of tutorials array.
     * Then calls onCreatingNewStep() to create the first step.
     * After all is done, save the whole tutorial array back
     */
    static onCreateNewRecording() {
        TutorialsModel.#tutorials.unshift(new TutorialObject());
        const stepId = TutorialsModel.onCreateNewStep();
        TutorialsModel.saveToStorage();
        return stepId
    }

    static loadTutorialsOnPageWhenRecording(callback) {
        const currentTutorial = TutorialsModel.#tutorials[0]
        TutorialsModel.smartInit(() => {
            TutorialsModel.#tutorials.unshift(currentTutorial)
            callback()
        })
    }

    static onCreateNewStep() {
        const id = uuidv4fourDigit();
        const step = new Step(id);
        if (TutorialsModel.getLastStepIndexForTutorial() < 0) {
            TutorialsModel.#tutorials[0].steps.push(step);
        } else {
            TutorialsModel.#tutorials[0].currentStepIndex = TutorialsModel.#tutorials[0].steps.push(step) - 1;
        }
        return id;
    }

    static updateCurrentStepWhenRecording(newStepIndex) {
        // TutorialsModel.syncFromUIToCurrentTutorialWhenRecording();
        // TutorialsModel.#tutorials[0].currentStepIndex = newStepIndex;
        // TutorialsModel.saveStep();
    }

    static saveTutorialBasicInfo(info, callback = () => { }) {
        TutorialsModel.#tutorials[0].name = info.name
        TutorialsModel.#tutorials[0].description = info.description
        TutorialsModel.saveActiveTutorialToStorage(callback)
    }

    static saveStep(step, atIndex, saveToStorage, callback = () => { }) {
        TutorialsModel.#tutorials[0].steps[atIndex] = step
        saveToStorage && TutorialsModel.saveActiveTutorialToStorage(callback)
    }

    static discardRecordingTutorial() {
        TutorialsModel.#tutorials.shift()
        TutorialsModel.saveToStorage()
    }



    //------------------------------------------------------------------------------------------
    //following tutorial functions
    //------------------------------------------------------------------------------------------
    static changeActiveTutorialToChosen(tutorialID, callback = () => { }) {
        //c(JSON.stringify(TutorialsModel.#tutorials))
        if (TutorialsModel.#tutorials.length > 1) {
            var tutorialToFollowIndex;
            TutorialsModel.#tutorials.forEach((tutorial, index) => {
                if (tutorial.id === tutorialID) {
                    tutorialToFollowIndex = index;
                }
            });
            const temp = TutorialsModel.#tutorials[0];
            TutorialsModel.#tutorials[0] = TutorialsModel.#tutorials[tutorialToFollowIndex];
            TutorialsModel.#tutorials[tutorialToFollowIndex] = temp;
            TutorialsModel.saveToStorage(() => {
                callback()
            });
        } else {
            callback()
        }
    }

    static changeCurrentTutorialStepIndexTo(index, callback = () => { }) {
        if (TutorialsModel.#tutorials[0].currentStepIndex === index) {
            callback()
            return
        };
        TutorialsModel.#tutorials[0].currentStepIndex = index;
        TutorialsModel.saveActiveTutorialToStorage(callback);
    }

    static revertCurrentTutorialToInitialState() {
        TutorialsModel.changeCurrentTutorialStepIndexTo(0)
    }

    static onTutorialFinished(callback = () => { }) {
        TutorialsModel.#checkIfReloadFromCloudIsNeeded(() => {
            c('reloading from cloud')
            TutorialsModel.#initializeFromFirestore(callback)
        }, () => {
            c('reverting current tutorial to initial state!')
            TutorialsModel.revertCurrentTutorialToInitialState()
            callback()
        })
    }

    static registerFunctionForOnTutorialFinishedLoading(fn) {
        TutorialsModel.#onTutorialFinishedLoadingFunctions.push(fn)
    }

    // static removeFunctionForOnTutorialFinishedLoading(fn) {
    //     TutorialsModel.#onTutorialFinishedLoadingFunctions.filter(item => item !== fn);
    // }

    static #onTutorialFinishedLoadingFunctions = [];

    static #onTutorialFinishedLoading() {
        TutorialsModel.#onTutorialFinishedLoadingFunctions.forEach(fn => { fn() })
        TutorialsModel.#onTutorialFinishedLoadingFunctions = [];
        TutorialsModel.isLoadingFromCloud = false;
    }


}

class TutorialObject {
    constructor(name = '', description = '', snapshot = [], steps = [], urls = [], id = null) {
        this.name = name;
        this.description = description;
        this.snapshot = snapshot;
        this.steps = steps;
        this.urls = urls;
        this.currentStepIndex = 0;
        this.id = id;
    }
}

class Step {
    /**
     * 
     * @param {number} index 
     * @param {number} actionType 
     * @param {RedirectAction | ClickAction | InputAction | SelectAction | SideInstructionAction} actionObject 
     * @param {[string]} possibleReasonsForElementNotFound
     */
    constructor(
        id,
        index = 0,
        actionType = VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK,
        actionObject = null,
        name = '',
        description = '',
        url = null,
        automationInterrupt = false,
        possibleReasonsForElementNotFound = []) {
        this.index = index;
        this.actionType = actionType;
        this.actionObject = actionObject;
        this.name = name;
        this.description = description;
        this.url = url;
        this.automationInterrupt = automationInterrupt;
        this.possibleReasonsForElementNotFound = possibleReasonsForElementNotFound;
        this.id = id;
    }

    static getPath(step, index = 0) {
        return Step.callFunctionOnActionType(
            step.actionType,
            () => { return ClickAction.getPath(step.actionObject, index) },
            () => { return ClickAction.getPath(step.actionObject, index) },
            () => { return InputAction.getPath(step.actionObject, index) },
            () => { return RedirectAction.getPath(step.actionObject, index) },
            () => { return SelectAction.getPath(step.actionObject, index) },
            () => { return SideInstructionAction.getPath(step.actionObject, index) },
        )
    }

    static callFunctionOnActionType(actionType, clickFunc, carFunc, inputFunc, redirectFunc, selectFunc, instructionFunc, defaultFunc = null) {
        switch (actionType) {
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK: case "STEP_ACTION_TYPE_CLICK":
                return clickFunc?.();
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK_REDIRECT:
                return carFunc?.();
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_INPUT: case "STEP_ACTION_TYPE_INPUT":
                return inputFunc?.();
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_REDIRECT:
                return redirectFunc?.();
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_SELECT:
                return selectFunc?.();
            case VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_SIDE_INSTRUCTION: case "STEP_ACTION_TYPE_SIDE_INSTRUCTION":
                return instructionFunc?.();
            default:
                return defaultFunc?.();
        }
    }

    static isStepCompleted(step) {
        return ((
            RedirectAction.isRedirectCompleted(step.actionObject) ||
            ClickAction.isClickActionCompleted(step.actionObject) ||
            InputAction.isInputCompleted(step.actionObject) ||
            SelectAction.isSelectCompleted(step.actionObject) ||
            SideInstructionAction.isSideInstructionCompleted(step.actionObject))
        )
    }
}