class ExtensionController {
    //Static
    static SHARED_FIRESTORE_REF = getFirestore(initializeApp(firebaseConfig))

    //Views
    #floatingSuggestionPopup

    //Controllers
    followTutorialViewController = null
    recordTutorialViewController = null

    constructor() {
        //this.#setUpIframeListner();
        this.checkStatus();
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

    checkStatus() {
        chrome.storage.sync.get(VALUES.TUTORIAL_STATUS.STATUS, (result) => {
            const savedStatus = result[VALUES.TUTORIAL_STATUS.STATUS];
            const cacheStatus = UserEventListnerHandler.tutorialStatusCache;
            console.log('status cache: ' + cacheStatus + '| saved status: ' + savedStatus)
            if ((cacheStatus === savedStatus) && (savedStatus !== VALUES.TUTORIAL_STATUS.BEFORE_INIT_NULL)) return;
            if (cacheStatus === VALUES.TUTORIAL_STATUS.BEFORE_INIT_NULL) {
                switch (savedStatus) {
                    case VALUES.TUTORIAL_STATUS.IS_RECORDING:
                    case VALUES.TUTORIAL_STATUS.IS_CREATING_NEW_TUTORIAL:
                        this.showRecordingPanel(savedStatus)
                        break;
                    case VALUES.TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL:
                    case VALUES.TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL:
                        this.#showFollowingPanel(savedStatus)
                        break;
                    default:
                        this.#suggestTutorialIfExists(savedStatus)
                        break;
                }
            }
        })
    }

    async #suggestTutorialIfExists(status) {
        await TutorialsModel.checkIfAnyTutorialExistsOnPage(() => {
            this.#showSuggestionPopup(status)
        })
    }

    #showSuggestionPopup(status) {
        $('body').append(`
            <div id="w-suggestion-popup">
                Looking for this?
            </div>
        `)
        this.#floatingSuggestionPopup = $('#w-suggestion-popup')
        setTimeout(() => {
            this.#floatingSuggestionPopup.css({
                left: '50px',
                transition: 'left 0.3s cubic-bezier(.19,.81,.69,.99)',
            })
        }, 100)
        setTimeout(() => {
            this.#floatingSuggestionPopup.css({
                left: '0px',
                transition: 'left 0.1s cubic-bezier(.7,.03,.15,.99)',
            })
        }, 400)
        this.#floatingSuggestionPopup.on('click', () => {
            this.#showFollowingPanel(status)
            this.#floatingSuggestionPopup.remove()
        })
    }

    #hideSuggestionPopup() {
        this.#floatingSuggestionPopup && this.#floatingSuggestionPopup.remove()
    }

    showRecordingPanel(status) {
        this.#hideFollowingPanel()
        this.recordTutorialViewController = new RecordTutorialViewController(status)
        this.#hideSuggestionPopup()
    }

    showUpdatePanel(status) {
        this.recordTutorialViewController = new RecordTutorialViewController(status)
        this.#hideSuggestionPopup()
    }

    #showFollowingPanel(status) {
        this.#hideRecordingPanel()
        this.followTutorialViewController = new FollowTutorialViewController(status, this)
        this.#hideSuggestionPopup()
    }

    #hideRecordingPanel() {
        this.recordTutorialViewController && this.recordTutorialViewController.dismiss()
        this.recordTutorialViewController = null
    }

    #hideFollowingPanel() {
        this.followTutorialViewController && this.followTutorialViewController.dismiss()
        this.followTutorialViewController = null
    }
}