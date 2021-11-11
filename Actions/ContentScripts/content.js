// Initialize Firebase
var app = initializeApp(firebaseConfig);
// initializeFirestore(app, { useFetchStreams: false });
// const analytics = getAnalytics(app);
var firestoreRef = getFirestore(app);

//cache
var currentUrl;
var currentUrlObj;
var globalCache = new GlobalCache();

//set up functions
async function setUp() {
    currentUrl = $(location).attr('href');
    syncStorageSet(VALUES.STORAGE.CURRENT_URL, currentUrl);
    currentUrlObj = new URL(currentUrl);

    chrome.storage.sync.get(VALUES.STORAGE.IS_RECORDING_ACTIONS, result => {
        const isRecording = result[VALUES.STORAGE.IS_RECORDING_ACTIONS];
        globalCache.globalEventsHandler.setIsRecordingCache(isRecording);
        if (!isRecording) {
            checkFollowingTutorialStatus();
        }
    })
    //setUpIframeListner();

}

$(() => {
    setUp();
})

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

//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
//MARK: Start of giving suggestions
//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
function automationSpeedSliderHelper() {
    chrome.storage.sync.get(VALUES.STORAGE.AUTOMATION_SPEED, result => {
        automationSpeedSlider.val(result[VALUES.STORAGE.AUTOMATION_SPEED]);
    })
}

async function fetchSimpleTutorials() {
    $('.w-not-following-tutorial-item').remove();
    automationSpeedSliderHelper();
    const domainName = "https://" + currentUrlObj.hostname + "/";
    const url_matches = [currentUrl, domainName];
    const simpleTutorialQuery = query(collection(firestoreRef,
        VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL),
        where(
            VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL_ALL_URLS,
            VALUES.FIRESTORE_QUERY_TYPES.ARRAY_CONTAINS_ANY,
            url_matches
        ));

    const simpleTutorialQuerySnapshot = await getDocs(simpleTutorialQuery);

    if (!simpleTutorialQuerySnapshot.empty) {
        mainPopUpContainer.show();
        //iterate query to add tutorial buttons
        simpleTutorialQuerySnapshot.forEach((tutorial) => {
            mainPopUpContainer.append(`
            <a class=\"w-simple-tutorial-button w-not-following-tutorial-item w-button-normal\" id=\"${tutorial.id}\">
                ${tutorial.data().name}
            </a>
            `);
            const button = $(`#${tutorial.id}`).first();

            //button click function. store tutorial's steps to storage
            button.on('click', () => {
                onFollowTutorialButtonClicked(tutorial);
            });
        });
    } else {
        mainPopUpContainer.hide();
    }
};

function showFollowingTutorialItems() {
    $('.w-follow-tutorial-options-item').hide();
    $('.w-following-tutorial-item').show();

    popUpStepName.html('');
    popUpStepDescription.html('');
}


async function onFollowTutorialButtonClicked(tutorial) {
    //toogle html elements
    globalCache.reHighlightAttempt = 0;
    $('.w-follow-tutorial-options-item').show();
    $('.w-not-following-tutorial-item').remove();
    popUpNextStepButton.hide();

    automationSpeedSliderHelper();

    popUpAutomateButton.on('click', () => {
        onPopUpAutomateButtonClicked(tutorial);
    })

    popUpManualButton.on('click', () => {
        onPopUpManualButtonClicked(tutorial);
    })
}

async function onPopUpAutomateButtonClicked(tutorial) {
    if (globalCache.tutorialObj !== null) {
        return;
    }
    loadTutorialToStorage(tutorial).then(() => {
        syncStorageSet(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, VALUES.FOLLOWING_TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL);
        globalCache.globalEventsHandler.setFollwingTutorialStatusCache(VALUES.FOLLOWING_TUTORIAL_STATUS.IS_AUTO_FOLLOWING_TUTORIAL);
        showTutorialStepAuto();
        showFollowingTutorialItems();
    })
}

async function onPopUpManualButtonClicked(tutorial) {
    if (globalCache.tutorialObj !== null) {
        return;
    }
    loadTutorialToStorage(tutorial).then(() => {
        syncStorageSet(VALUES.FOLLOWING_TUTORIAL_STATUS.STATUS, VALUES.FOLLOWING_TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL);
        globalCache.globalEventsHandler.setFollwingTutorialStatusCache(VALUES.FOLLOWING_TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL);
        showTutorialStepManual();
        showFollowingTutorialItems();
    })
}

async function loadTutorialToStorage(tutorial) {
    syncStorageSet(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_ID, tutorial.id);
    //get all information about the tutorial from firebase
    const stepsQuery = query(collection(firestoreRef,
        VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL,
        tutorial.id,
        VALUES.FIRESTORE_CONSTANTS.SIMPLE_TUTORIAL_STEPS
    ), orderBy(VALUES.FIRESTORE_CONSTANTS.STEP_INDEX));
    const stepsQuerySnapshot = await getDocs(stepsQuery);
    //construct steps array from query
    var steps = [];
    //TODO!: solve url problem (possibly using regex)
    var isFirstStepReached = false;
    stepsQuerySnapshot.forEach((step) => {
        const data = step.data();
        //remove steps used prior to accessing this page
        if (isFirstStepReached) {
            steps.push(data);
        } else {
            // if (url[0] === '/') {
            //     //regex
            //     const regex = new RegExp(url.substr(1, url.length - 2));
            //     if (regex.test(currentUrl)) {
            //         isFirstStepReached = true;
            //         steps.push(data);
            //     }
            // } else {
            //     if (url === currentUrl) {
            //         isFirstStepReached = true;
            //         steps.push(data);
            //     }
            // }
            if (checkIfUrlMatch(data.url, currentUrl)) {
                isFirstStepReached = true;
                steps.push(data);
            }
        }
    })

    //construct tutorial object
    const tutorialObj = new SimpleTutorial(steps)
    syncStorageSet(VALUES.TUTORIAL_ID.CURRENT_FOLLOWING_TUTORIAL_OBJECT_ID, tutorialObj);
    globalCache.tutorialObj = tutorialObj;
}

function clearUIOnNextStep() {
    removeLastHighlight();
}



/**
 * Stimulate any type of click using javascript's dispatch event. Covers cases where jquery.click() or 
 * .trigger('click') don't work
 * @param {HTML Element} element 
 */
function simulateClick(element, eventType = 'click') {
    if (isNotNull(element)) {
        console.log(`simulating click on ${element}`)
        globalCache.isSimulatingClick = true;
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
//MARK: Start of recording events
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
        console.log(globalCache.isSimulatingClick)
        if (!globalCache.isSimulatingClick) {
            processEventHelper(event.target);
        }
        globalCache.isSimulatingClick = false;
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
    if (!globalCache.isSimulatingClick && globalCache.globalEventsHandler.isLisentingRecording) {
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
        switch (globalCache.globalEventsHandler.followingTutorialStatusCache) {
            case VALUES.FOLLOWING_TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL:
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

async function onClickWhenRecording() {
    //get element
    const jQElement = $(globalCache.currentElement);

    syncStorageSet(VALUES.STORAGE.CURRENT_SELECTED_ELEMENT, globalCache.domPath);

    //get table if it exists for tutorial
    const nearestTable = getNearestTableOrList(jQElement[0]);
    if (!isNotNull(nearestTable)) {
        syncStorageSet(VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE, null);
    } else {
        var nearestTablePath = getShortDomPathStack(nearestTable)
        if ($(jqueryElementStringFromDomPath(nearestTablePath)).length > 1) {
            nearestTablePath = getCompleteDomPathStack(nearestTable);
        }
        syncStorageSet(VALUES.STORAGE.CURRENT_SELECTED_ELEMENT_PARENT_TABLE, nearestTablePath);
    }
    //Highlight
    if (jQElement.is('a')) {
        highlightAndRemoveLastHighlight(jQElement.parent());
    } else {
        highlightAndRemoveLastHighlight(jQElement);
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
    if (globalCache.currentStep.possibleReasonsForElementNotFound.length > 0) {
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
    const stepName = globalCache.currentStep.name;
    const stepDescription = globalCache.currentStep.description;

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
        if (isNotNull(request.isRecordingStatus)) {
            globalCache.globalEventsHandler.setIsRecordingCache(request.isRecordingStatus);
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

//Clean stuff
window.onbeforeunload = () => {

}