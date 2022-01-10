class ExtensionController {
    static #app = initializeApp(firebaseConfig);
    // initializeFirestore(app, { useFetchStreams: false });
    static FIRESTORE_REF = getFirestore(this.#app);
    static TUTORIALS = new TutorialsModel();

    followTutorialViewController = null
    recordTutorialViewController = null

    constructor() {

        globalCache = new GlobalCache();
        uiManager = new UIManager();
        tutorialsManager = new TutorialsManager();
        //this.#setUpIframeListner();
        this.#checkStatus();
    }



    #setUpIframeListner() {
        getFrameContents();
        function getFrameContents() {
            const iFrame = document.getElementsByTagName('iframe')[0];
            if (!isNotNull(iFrame)) {
                return;
            }
            if (!isNotNull(iFrame.contentDocument)) {
                setTimeout(() => {
                    getFrameContents();
                }, 1000);
                return;
            }
            let iFrameBody = iFrame.contentDocument.getElementsByTagName('body')[0];

            let iFrameBodyJQ = $(iFrameBody);
            // iFrameBodyJQ.on('click', async (event) => {
            //     onClickUniversalHandler(event);
            // })
        }
    }

    #checkStatus() {
        chrome.storage.sync.get(VALUES.TUTORIAL_STATUS.STATUS, (result) => {
            const savedStatus = result[VALUES.TUTORIAL_STATUS.STATUS];
            const cacheStatus = globalCache.globalEventsHandler.tutorialStatusCache;
            console.log('status cache: ' + cacheStatus + '| saved status: ' + savedStatus)
            if ((cacheStatus === savedStatus) && (savedStatus !== VALUES.TUTORIAL_STATUS.BEFORE_INIT_NULL)) return;
            if (savedStatus === VALUES.TUTORIAL_STATUS.STOPPED_FROM_OTHER_PAGE) {
                onStopTutorialButtonClicked();
                return;
            }
            if (cacheStatus === VALUES.TUTORIAL_STATUS.BEFORE_INIT_NULL) {
                globalCache.globalEventsHandler.setTutorialStatusCache(savedStatus);
                switch (savedStatus) {
                    case VALUES.TUTORIAL_STATUS.BEFORE_INIT_NULL:
                        fetchTutorialsFromCloud();
                        globalCache.globalEventsHandler.setTutorialStatusCache(VALUES.TUTORIAL_STATUS.LOADED);
                        break;
                    case VALUES.TUTORIAL_STATUS.LOADED:
                        fetchTutorialsFromCloud();
                        break;
                    case VALUES.TUTORIAL_STATUS.STOPPED_FROM_OTHER_PAGE:
                        onStopTutorialButtonClicked();
                        break;
                    case VALUES.TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL:
                        mainPopUpContainer.show();
                        tutorialsManager.loadCurrentTutorialFromStorage(tutorialsManager.showCurrentStep);
                        break;
                    case VALUES.TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL:
                        mainPopUpContainer.show();
                        tutorialsManager.loadCurrentTutorialFromStorage(tutorialsManager.showCurrentStep);
                        break;
                    case VALUES.TUTORIAL_STATUS.IS_RECORDING:
                        tutorialsManager.loadFromStorage(tutorialsManager.updateUIWhenRecording);
                        break;
                    default:
                        break;
                }
            }
        })
    }

    //------------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------------
    //MARK: Fetch tutorial on the current page
    //------------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------------
    fetchTutorialsFromStorage() {
        uiManager.onFetchingTutorialsFromCloud();
        tutorialsManager.loadFromStorage(() => {
            tutorialsManager.tutorials.forEach((tutorial) => {
                const tutorialID = tutorial.id;
                uiManager.loadSingleTutorialButton(tutorial, tutorialID);
            });
        });
    }

    fetchTutorialsFromCloud() {
        uiManager.onFetchingTutorialsFromCloud();

        const tutorialsQuerySnapshot = await getDocs(getMatchedTutorialsQuery());

        if (!tutorialsQuerySnapshot.empty) {
            console.log('fetchTutorialsFromCloud() -> query not empty')
            mainPopUpContainer.show();
            tutorialsManager.initiateFtomFirestore(tutorialsQuerySnapshot);
        } else {
            mainPopUpContainer.hide();
        }

        function getMatchedTutorialsQuery() {
            const domainName = "https://" + globalCache.currentURLObj.hostname + "/";
            const url_matches = [globalCache.currentUrl, domainName];
            return query(collection(ExtensionController.FIRESTORE_REF,
                VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL),
                where(
                    VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL_ALL_URLS,
                    VALUES.FIRESTORE_QUERY_TYPES.ARRAY_CONTAINS_ANY,
                    url_matches
                )
            );
        }
    };

    showRecordingPanel() {
        this.recordTutorialViewController = new RecordTutorialViewController()
    }

    showMainPopup() {
        this.followTutorialViewController = new FollowTutorialViewController()
    }
}