var app = initializeApp(firebaseConfig);
// initializeFirestore(app, { useFetchStreams: false });
var firestoreRef = getFirestore(app);

var currentUrl;
var currentUrlObj;
var globalCache = new GlobalCache();
var uiManager = new UIManager();
var tutorialsManager = new TutorialsManager();

$(() => {
    setUp();
})

//set up functions
async function setUp() {
    currentUrl = $(location).attr('href');
    syncStorageSet(VALUES.STORAGE.CURRENT_URL, currentUrl);
    currentUrlObj = new URL(currentUrl);

    //setUpIframeListner();
    checkStatus();
}

function setUpIframeListner() {
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

/**
 * Entry point for all behaviors
 */
async function checkStatus() {
    chrome.storage.sync.get(VALUES.TUTORIAL_STATUS.STATUS, (result) => {
        const recordingStatus = result[VALUES.TUTORIAL_STATUS.STATUS];
        globalCache.globalEventsHandler.setTutorialStatusCache(recordingStatus);
        switch (recordingStatus) {
            case VALUES.TUTORIAL_STATUS.IS_RECORDING:
                tutorialsManager.loadFromStorage(tutorialsManager.updateUIWhenRecording);

                break;
            case VALUES.TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL:
                tutorialsManager.loadCurrentTutorialFromStorage(tutorialsManager.showCurrentStep);
                globalCache.globalEventsHandler.setTutorialStatusCache(recordingStatus);
                break;
            case VALUES.TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL:
                tutorialsManager.loadCurrentTutorialFromStorage(tutorialsManager.showCurrentStep);
                globalCache.globalEventsHandler.setTutorialStatusCache(recordingStatus);
                break;
            case VALUES.TUTORIAL_STATUS.IDLE:
                fetchTutorialsFromCloud();
                break;
            default:
                onStopTutorialButtonClicked();
                break;
        }
        console.log('checkStatus() -> Status: ' + recordingStatus);
    })
}

//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
//MARK: Fetch tutorial on the current page
//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
function automationSpeedSliderHelper() {
    automationSpeedSlider.val(globalCache.speedBarValue);
}

async function fetchTutorialsFromCloud() {
    $('.w-not-following-tutorial-item').remove();
    automationSpeedSliderHelper();

    const tutorialsQuerySnapshot = await getDocs(getMatchedTutorialsQuery());

    if (!tutorialsQuerySnapshot.empty) {
        console.log('fetchTutorialsFromCloud() -> query not empty')
        mainPopUpContainer.show();
        tutorialsManager.initiateFtomFirestore(tutorialsQuerySnapshot);
    } else {
        mainPopUpContainer.hide();
    }

    function getMatchedTutorialsQuery() {
        const domainName = "https://" + currentUrlObj.hostname + "/";
        const url_matches = [currentUrl, domainName];
        return query(collection(firestoreRef,
            VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL),
            where(
                VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL_ALL_URLS,
                VALUES.FIRESTORE_QUERY_TYPES.ARRAY_CONTAINS_ANY,
                url_matches
            )
        );
    }
};

function showFollowingTutorialItems() {
    $('.w-follow-tutorial-options-item').hide();
    $('.w-following-tutorial-item').show();

    popUpStepName.html('');
    popUpStepDescription.html('');
}


function clearUIOnNextStep() {
    removeLastHighlight();
}

//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
//MARK: Event Handling
//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
function addGlobalEventListenersWhenRecording() {
    $('*').on('blur focus focusin focusout load resize scroll unload dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error',
        preventDefaultHelper);
    $('*').on('click', onClickHelper);
}

function removeGlobalEventListenersWhenRecording() {
    $('*').off('blur focus focusin focusout load resize scroll unload dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error',
        preventDefaultHelper);
    $('*').off('click', onClickHelper);
}

function addGlobalEventListenersWhenFollowing() {
    $('*').on('click', onClickHelper);
}

function removeGlobalEventListenersWhenFollowing() {
    $('*').off('click', onClickHelper);
}

/**blur focus focusin focusout load resize scroll unload dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error
*/

function onClickHelper(event) {
    preventDefaultHelper(event);
    if (event.target !== globalCache.currentElement) {
        processEventHelper(event.target);
    }
}

function processEventHelper(target) {
    globalCache.domPath = getShortDomPathStack(target);
    if ($(jqueryElementStringFromDomPath(globalCache.domPath)).length > 1) {
        globalCache.domPath = getCompleteDomPathStack(target);
    }
    console.log(`clicking: ${globalCache.domPath}`);
    globalCache.currentElement = target;
    onClickUniversalHandler();
}

function preventDefaultHelper(event) {
    if (globalCache.globalEventsHandler.isLisentingRecording) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false
    }
}

async function onClickUniversalHandler() {
    if (globalCache.globalEventsHandler.isLisentingRecording) {
        onClickWhenRecording();
    } else if (globalCache.globalEventsHandler.isLisentingFollowing) {
        switch (globalCache.globalEventsHandler.tutorialStatusCache) {
            case VALUES.TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL:
                onClickWhenFollowingTutorial();
                break;
            default:
                break;
        }
    }
    if (globalCache.globalEventsHandler.isAutomationInterrupt) {
        onClickWhenFollowingTutorial();
    }
}


/**
 * Stimulate any type of click using javascript's dispatch event. Covers cases where jquery.click() or 
 * .trigger('click') don't work
 * @param {HTML Element} element 
 */
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
}



//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
//MARK: highlight functions
//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
function highlightAndScollTo(path, callback = () => { }) {
    const jQElement = $(jqueryElementStringFromDomPath(path));
    const htmlElement = jQElement[0];

    //TODO: bug
    if (isNotNull(jQElement.attr("class")) && arrayContains(jQElement.attr("class").split(/\s+/), ['w-highlight-box', 'w-highlight-box-specifier'])) {
        return;
    }

    if (highlightAndRemoveLastHighlight(jQElement, path, callback)) {
        //Scroll
        globalCache.currentJQScrollingParent = $(getScrollParent(htmlElement, false));
        var offset = 0;
        const eleOffset = jQElement.offset();
        const scrollParentOffset = globalCache.currentJQScrollingParent.offset();
        if (isNotNull(eleOffset) && isNotNull(scrollParentOffset)) {
            offset = parseInt(eleOffset.top) - parseInt(scrollParentOffset.top) - window.innerHeight / 2
        }
        globalCache.currentJQScrollingParent.animate({
            scrollTop: `+=${offset}px`
        }, globalCache.interval).promise().then(() => {
            callback();
        })
    }
}

function clearReHighlightTimer() {
    isNotNull(globalCache.reHighlightTimer) && clearTimeout(globalCache.reHighlightTimer);
    globalCache.reHighlightTimer = null;
}

function elementNotFoundHandler() {
    if (tutorialsManager.getCurrentStep().possibleReasonsForElementNotFound.length > 0) {
        //show in highlight instruction window why might the cause of error be
    }
}

function highlightAndRemoveLastHighlight(jQElement, path = null, callback = null) {
    //if path is null, calling from recording highlight
    if (path !== null) {
        //Repeat if element not found, might not be handled here
        if (!isNotNull(jQElement[0])) {
            if (globalCache.reHighlightAttempt > 5) {
                //stop refinding element
                console.error("ELEMENT NOT FOUND");
                globalCache.reHighlightTimer = null;
                //onStopTutorialButtonClicked();
                highlightInstructionWindow.hide();
                elementNotFoundHandler();
                return false;
            }
            globalCache.reHighlightAttempt++;
            setTimeout(() => {
                globalCache.reHighlightTimer = highlightAndScollTo(path, callback);
            }, 300);
            return false;
        }
        globalCache.reHighlightAttempt = 0;
        clearReHighlightTimer();
        console.trace();
        updateHighlightInstructionWindow(jQElement);
        highlightAndRemoveLastHighlightHelper();
        return true;
    } else {
        highlightAndRemoveLastHighlightHelper();
        return false
    }

    function highlightAndRemoveLastHighlightHelper() {
        removeLastHighlight();
        jQElement.addClass('w-highlight-box w-highlight-box-specifier');
        alertElement(jQElement);

        function alertElement(element) {
            var perAnimationBorderLoopCount = 0;

            borderOut();

            globalCache.alertElementInterval = setInterval(() => {
                element.stop();
                element.removeAttr('style');
                borderOut();
            }, 3500);

            function borderOut() {
                element.animate({
                    boxShadow: '0px 0px 3px 6px rgba(255, 60, 43, 1)',
                }, 300).promise().then(() => {
                    borderIn();
                });
            }

            function borderIn() {
                element.animate({
                    boxShadow: '0px 0px 3px 6px rgba(255, 200, 42, 1)',
                }, 300).promise().then(() => {
                    if (perAnimationBorderLoopCount++ < 2) {
                        borderOut();
                    } else {
                        element.stop();
                        element.removeAttr('style');
                        perAnimationBorderLoopCount = 0;
                    }
                });
            }
        }
    }
}

function removeLastHighlight() {
    //stop timers and animations
    clearReHighlightTimer()
    isNotNull(globalCache.currentJQScrollingParent) && globalCache.currentJQScrollingParent.stop();
    globalCache.currentJQScrollingParent = null;
    clearInterval(globalCache.alertElementInterval);
    globalCache.alertElementInterval = null;

    const highlightedElements = $('.w-highlight-box.w-highlight-box-specifier');
    highlightedElements.stop(true);
    highlightedElements.removeAttr('style');
    highlightedElements.removeClass('w-highlight-box w-highlight-box-specifier');
}



var updateCount = 0;
function updateHighlightInstructionWindow(element) {
    const stepName = tutorialsManager.getCurrentStep().name;
    const stepDescription = tutorialsManager.getCurrentStep().description;

    if (isNotNull(stepName) || isNotNull(stepDescription)) {
        highlightInstructionWindow.show();
        const layout = getInstructionWindowLayout(element);
        //console.log(layout);
        highlightInstructionWindow.css(layout.css);
        movePopupIfOverlap();
        updateStepInstructionUIHelper();
        if (updateCount === 0) {
            setTimeout(() => {
                updateHighlightInstructionWindow(element);
            }, 200);
            updateCount++;
        } else {
            updateCount = 0;
        }
    } else {

    }
}







//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
//MARK: message handler
//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (isNotNull(request.redirect)) {
            location.replace(request.redirect)
        }
        if (isNotNull(request.clickPath)) {
            simulateClick($(jqueryElementStringFromDomPath(request.clickPath))[0]);
        }
        if (isNotNull(request.removeHighlight) && request.removeHighlight) {
            removeLastHighlight()
        }
        if (isNotNull(request.onActivated) && request.onActivated) {
            setUp();
        }
        if (isNotNull(request.newTutorial) && request.newTutorial) {
            recordingContainer.show();
        }
    }
);
