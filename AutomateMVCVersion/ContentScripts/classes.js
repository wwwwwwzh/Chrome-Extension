function isStepCompleted(step) {
    return ((
        isRedirectCompleted(step.actionObject) ||
        isClickActionCompleted(step.actionObject) ||
        isInputCompleted(step.actionObject) ||
        isSelectCompleted(step.actionObject) ||
        isSideInstructionCompleted(step.actionObject)) &&
        isNotNull(step.index) &&
        step.actionType !== VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL &&
        typeof step.actionObject !== 'NullAction'
    )
}


/**
 * Placeholder action class for initialization of step object
 */
class NullAction {

}

class RedirectAction {
    constructor(url) {
        this.url = url;
    }
}

function isRedirectCompleted(redirect) {
    return (isNotNull(redirect.url));
}


class ClickAction {
    /**
     * 
     * @param {ClickGuide} defaultClick
     * @param {[ClickGuide]} optionsClick 
     */
    constructor(defaultClick, optionsClick) {
        this.defaultClick = defaultClick;
        this.optionsClick = optionsClick;
    }
}

function isClickActionCompleted(click) {
    return isClickGuideCompleted(click.defaultClick);
}

/**
 * Helper class to wrap what to do during one click action step. Used in ClickAction
 */
class ClickGuide {
    /**
     * 
     * @param {[string]} path 
     * @param {string} name 
     * @param {string} description 
     * @param {boolean} isRedirect
     * @param {string} url
     */
    constructor(path, name, description, isRedirect, url, useAnythingInTable, table) {
        this.path = path;
        this.name = name;
        this.description = description;
        this.isRedirect = isRedirect;
        this.url = url;
        this.useAnythingInTable = useAnythingInTable;
        this.table = table;
    }
}

function isClickGuideCompleted(clickGuide) {
    return (
        isNotNull(clickGuide) &&
        isNotNull(clickGuide.path) &&
        clickGuide.path.length > 0 &&
        clickGuide.name !== null &&
        clickGuide.name !== "" &&
        isNotNull(clickGuide.isRedirect))
}

class InputAction {
    /**
     * Path is required. Default text used to fill input when selecting using default. 
     * If there is no default, automation halts and asks for input. If options exist,
     * automation halts when not using default and asks for input (options only used as
     * suggestions). 
     * @param {[string]} path 
     * @param {string} defaultText 
     * @param {[string]} optionsText 
     * @param {string} inputType 
     */
    constructor(path, defaultText, optionsText, inputType) {
        this.path = path;
        this.defaultText = defaultText;
        this.optionsText = optionsText;
        this.inputType = inputType;
    }
}

function isInputCompleted(input) {
    return (isNotNull(input.path) && input.path !== [] && isNotNull(input.defaultText) && input.inputType !== "");
}

class SelectAction {
    /**
     * 
     * @param {[string]} path path to the <select> element. not option
     * @param {string} defaultValue html value attribute, from VALUE.ACTION_TYPE
     */
    constructor(path, defaultValue) {
        this.path = path;
        this.defaultValue = defaultValue;
    }
}

function isSelectCompleted(select) {
    return (isNotNull(select.path) && select.path !== [] && select.defaultValue !== "")
}


class SideInstructionAction {
    constructor(path) {
        this.path = path;
    }
}

function isSideInstructionCompleted(si) {
    return (isNotNull(si.path) && si.path !== [])
}

class UserEventListnerHandler {
    constructor(onClickWhenFollowingTutorial, onClickWhenRecording) {

        this.tutorialStatusCache = VALUES.TUTORIAL_STATUS.BEFORE_INIT_NULL;
        this.isLisentingRecording = false;
        this.isLisentingFollowing = false;
        this.isAutomationInterrupt = false;
        this.isOnRightPage = true;
        this.onClickWhenFollowingTutorial = onClickWhenFollowingTutorial
        this.onClickWhenRecording = onClickWhenRecording
        this.selfReference = this
        this.#removeGlobalEventListenersWhenFollowing();
        this.#removeGlobalEventListenersWhenRecording();
    }

    setTutorialStatusCache(tutorialStatusCache) {
        syncStorageSet(VALUES.TUTORIAL_STATUS.STATUS, tutorialStatusCache);
        this.tutorialStatusCache = tutorialStatusCache;
        this.#onChange();
    }

    setIsAutomationInterrupt(isAutomationInterrupt) {
        this.isAutomationInterrupt = isAutomationInterrupt;
        this.#onChange();
    }

    setIsOnRightPage(isOnRightPage) {
        this.isOnRightPage = isOnRightPage;
        this.#onChange();
    }

    #addGlobalEventListenersWhenRecording() {
        $('*').on('blur focus focusin focusout load resize scroll unload dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error',
            this.selfReference.#preventDefaultHelper);
        $('*').on('click', this.selfReference.#onClickHelper);
    }

    #onChange() {
        //add or remove when recording or not recording
        if (this.tutorialStatusCache === VALUES.TUTORIAL_STATUS.IS_RECORDING) {
            if (!this.isLisentingRecording) {
                this.#addGlobalEventListenersWhenRecording();
                this.isLisentingRecording = true;
            }
        } else {
            if (this.isLisentingRecording) {
                this.#removeGlobalEventListenersWhenRecording();
                this.isLisentingRecording = false;
            }
        }

        if (this.isOnRightPage && (this.isAutomationInterrupt || (this.tutorialStatusCache === VALUES.TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL))) {
            if (!this.isLisentingFollowing) {
                this.#addGlobalEventListenersWhenFollowing();
                this.isLisentingFollowing = true;
            }
        } else {
            if (this.isLisentingFollowing) {
                this.#removeGlobalEventListenersWhenFollowing();
                this.isLisentingFollowing = false;
            }
        }
    }

    #removeGlobalEventListenersWhenRecording() {
        $('*').off('blur focus focusin focusout load resize scroll unload dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error',
            this.selfReference.#preventDefaultHelper);
        $('*').off('click', this.selfReference.#onClickHelper);
    }

    #addGlobalEventListenersWhenFollowing() {
        $('*').on('click', this.selfReference.#onClickHelper);
    }

    #removeGlobalEventListenersWhenFollowing() {
        $('*').off('click', this.selfReference.#onClickHelper);
    }

    #onClickHelper(event) {
        const eventHandler = ExtensionController.SHARED_USER_EVENT_LISTNER_HANDLER
        eventHandler.#preventDefaultHelper(event);
        if (event.target !== globalCache.currentElement &&
            event.target !== stopOptionsStopButton[0] &&
            !$.contains(recordingContainer[0], event.target)) {
            eventHandler.#processEventHelper(event.target);
        }
    }

    #processEventHelper(target) {
        const eventHandler = ExtensionController.SHARED_USER_EVENT_LISTNER_HANDLER
        globalCache.domPath = getShortDomPathStack(target);
        if ($(jqueryElementStringFromDomPath(globalCache.domPath)).length > 1) {
            globalCache.domPath = getCompleteDomPathStack(target);
        }
        console.log(`clicking: ${globalCache.domPath}`);
        globalCache.currentElement = target;
        eventHandler.#onClickUniversalHandler();
    }

    #preventDefaultHelper(event) {
        const eventHandler = ExtensionController.SHARED_USER_EVENT_LISTNER_HANDLER
        if (eventHandler.isLisentingRecording) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false
        }
    }

    async #onClickUniversalHandler() {
        const eventHandler = ExtensionController.SHARED_USER_EVENT_LISTNER_HANDLER
        if (eventHandler.isLisentingRecording) {
            eventHandler.onClickWhenRecording();
        } else if (eventHandler.isLisentingFollowing) {
            switch (eventHandler.tutorialStatusCache) {
                case VALUES.TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL:
                    eventHandler.onClickWhenFollowingTutorial();
                    break;
                default:
                    break;
            }
        }
        if (eventHandler.isAutomationInterrupt) {
            eventHandler.onClickWhenFollowingTutorial();
        }
    }
}

class GlobalCache {
    constructor(
        tutorialObj = null,
        currentStep = null,
        interval = 2000,
        domPath = null,
        currentElement = null,
        reHighlightAttempt = 0,
        lastSelectedElement = null,
        lastSelectedElementCSS = null,
        currentJQScrollingParent = null,
    ) {
        this.tutorialObj = tutorialObj;
        this.currentStep = currentStep;
        this.interval = interval;
        this.domPath = domPath;
        this.currentElement = currentElement;
        this.reHighlightAttempt = reHighlightAttempt;
        this.lastHighlightedElement = lastSelectedElement;
        this.lastHighlightedElementCSS = lastSelectedElementCSS;
        this.currentJQScrollingParent = currentJQScrollingParent;
        this.alertElementInterval = null;
        this.sideInstructionAutoNextTimer = null;
        this.isMainPopUpCollapsed = false;
        this.reHighlightTimer = null;
        this.isRecordingButtonOn = false;
        this.speedBarValue = 50;
        this.currentUrl = $(location).attr('href');
        this.currentURLObj = new URL(this.currentUrl);
        this.isUsingAdvancedRecordingPanel = false;
    }


}