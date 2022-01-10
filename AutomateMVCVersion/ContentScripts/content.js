var globalCache;
var uiManager;
var tutorialsManager;


let extension

$(() => {
    extension = new ExtensionController()
})

//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
//MARK: Fetch tutorial on the current page
//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
function automationSpeedSliderHelper() {
    automationSpeedSlider.val(globalCache.speedBarValue);
}

function fetchTutorialsFromStorage() {
    uiManager.onFetchingTutorialsFromCloud();
    tutorialsManager.loadFromStorage(() => {
        tutorialsManager.tutorials.forEach((tutorial) => {
            const tutorialID = tutorial.id;
            uiManager.loadSingleTutorialButton(tutorial, tutorialID);
        });
    });
}

async function fetchTutorialsFromCloud() {
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
    if (event.target !== globalCache.currentElement &&
        event.target !== stopOptionsStopButton[0] &&
        !$.contains(recordingContainer[0], event.target)) {
        processEventHelper(event.target);
    }
}

function processEventHelper(target) {
    globalCache.domPath = getShortDomPathStack(target);
    console.log(getShortDomPathStack(target))
    if ($(jqueryElementStringFromDomPath(globalCache.domPath)).length > 1) {
        globalCache.domPath = getCompleteDomPathStack(target);
    }
    console.log(`clicking: ${globalCache.domPath}`);
    globalCache.currentElement = target;
    onClickUniversalHandler();
}

function preventDefaultHelper(event) {
    if (globalCache.globalEventsHandler.isLisentingRecording && !$.contains(recordingContainer[0], event.target)) {
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
    console.trace();
}



//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
//MARK: highlight functions
//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
function highlightAndScollTo(path, isRemoveLastHighlight = true, callback = () => { }) {
    isRemoveLastHighlight && removeLastHighlight();
    const jQElementToHighlight = highlightElementNullCheck(path);

    function highlightElementNullCheck(path) {
        //TODO: regex path may highlight multiple elements, show all or what
        const jQElementToHighlight = $(jqueryElementStringFromDomPath(path));
        console.log('jQElementToHighlight:' + JSON.stringify(jQElementToHighlight))
        if (path !== null) {
            if (!(isNotNull(jQElementToHighlight[0]) && jQElementToHighlight.css('display') !== 'none')) {
                //element not found
                highlightInstructionWindow.hide();

                if (globalCache.reHighlightAttempt > 5) {
                    //stop refinding element
                    console.error("ELEMENT NOT FOUND");
                    globalCache.reHighlightTimer = null;
                    elementNotFoundHandler();
                    return null;
                }
                globalCache.reHighlightAttempt++;
                globalCache.reHighlightTimer = setTimeout(() => {
                    highlightAndScollTo(path, callback);
                }, 200);
                return null;
            }
            globalCache.reHighlightAttempt = 0;
            clearReHighlightTimer();
            return jQElementToHighlight;
        } else {
            return null
        }
    }

    if (!isNotNull(jQElementToHighlight)) return;
    if (isNotNull(jQElementToHighlight.attr("class")) && arrayContains(jQElementToHighlight.attr("class").split(/\s+/), ['w-highlight-box', 'w-highlight-box-specifier'])) return;

    highlight(jQElementToHighlight);
    updateHighlightInstructionWindow(jQElementToHighlight);

    //Scroll
    scrollToElement()

    function scrollToElement() {
        globalCache.currentJQScrollingParent = $(getScrollParent(jQElementToHighlight[0], false));
        var offset = 0;
        const eleOffset = jQElementToHighlight.offset();
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
    const firstStepOnPageIndex = tutorialsManager.getFirstStepIndexOnCurrentPage();
    if (firstStepOnPageIndex > -1) {
        tutorialsManager.onFollowingStep(firstStepOnPageIndex);
        // if (tutorialsManager.getCurrentStep().possibleReasonsForElementNotFound.length > 0) {
        //     //show in highlight instruction window why might the cause of error be
        // }
    }
}

function highlight(jQElement) {
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

function highlightAndRemoveLastHighlight(jQElement) {
    removeLastHighlight()
    highlight(jQElement);
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
            checkStatus();
        }
        if (isNotNull(request.newTutorial) && request.newTutorial) {
            //recordingContainer.show();
            extension.showRecordingPanel();
            tutorialsManager.onCreatingNewRecording();
        }
    }
);

chrome.storage.onChanged.addListener((changes, areaName) => {
    //console.log(JSON.stringify(changes))
})

