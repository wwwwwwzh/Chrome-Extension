class SimpleTutorial {
    /**
     * 
     * @param {Step} steps 
     */
    constructor(steps) {
        this.steps = steps;
        this.currentStep = 0;
    }
};

class Step {
    /**
     * 
     * @param {number} index 
     * @param {string} actionType 
     * @param {RedirectAction | ClickAction | InputAction | SelectAction | SideInstructionAction | NullAction} actionObject 
     */
    constructor(index, actionType, actionObject, name, description, url, automationInterrupt = false) {
        this.index = index;
        this.actionType = actionType;
        this.actionObject = actionObject;
        this.name = name;
        this.description = description;
        this.url = url;
        this.automationInterrupt = automationInterrupt;
    }
}

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

class GlobalEventsHandler {
    constructor() {
        removeGlobalEventListenersWhenFollowing();
        removeGlobalEventListenersWhenRecording();
        this.isRecordingCache = false;
        this.followingTutorialStatusCache = VALUES.FOLLOWING_TUTORIAL_STATUS.NOT_FOLLOWING_TUTORIAL;
        this.isLisentingRecording = false;
        this.isLisentingFollowing = false;
        this.isAutomationInterrupt = false;
        this.isOnRightPage = true;
    }

    onChange() {
        //add or remove when recording or not recording
        if (this.isRecordingCache) {
            if (!this.isLisentingRecording) {
                addGlobalEventListenersWhenRecording();
                this.isLisentingRecording = true;
            }
        } else {
            if (this.isLisentingRecording) {
                removeGlobalEventListenersWhenRecording();
                this.isLisentingRecording = false;
            }
        }

        if (this.isOnRightPage && (this.isAutomationInterrupt || (this.followingTutorialStatusCache === VALUES.FOLLOWING_TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL))) {
            if (!this.isLisentingFollowing) {
                addGlobalEventListenersWhenFollowing();
                this.isLisentingFollowing = true;
            }
        } else {
            if (this.isLisentingFollowing) {
                removeGlobalEventListenersWhenFollowing();
                this.isLisentingFollowing = false;
            }
        }
    }

    setIsRecordingCache(isRecording) {
        this.isRecordingCache = isRecording;
        this.onChange();
    }

    setFollwingTutorialStatusCache(followingTutorialStatusCache) {
        this.followingTutorialStatusCache = followingTutorialStatusCache;
        this.onChange();
    }

    setIsAutomationInterrupt(isAutomationInterrupt) {
        this.isAutomationInterrupt = isAutomationInterrupt;
        this.onChange();
    }

    setIsOnRightPage(isOnRightPage) {
        this.isOnRightPage = isOnRightPage;
        this.onChange();
    }
}

class GlobalCache {
    constructor(
        tutorialObj = null,
        currentStep = null,
        interval = 2000,
        reHighlightTimer = null,
        isSimulatingClick = false,
        globalEventsHandler = new GlobalEventsHandler(),
        domPath = null,
        currentElement = null,
        reHighlightAttempt = 0,
        lastSelectedElement = null,
        lastSelectedElementCSS = null,
        currentJQScrollingParent = null
    ) {
        this.tutorialObj = tutorialObj;
        this.currentStep = currentStep;
        this.interval = interval;
        this.reHighlightTimer = reHighlightTimer;
        this.isSimulatingClick = isSimulatingClick;
        this.globalEventsHandler = globalEventsHandler;
        this.domPath = domPath;
        this.currentElement = currentElement;
        this.reHighlightAttempt = reHighlightAttempt;
        this.lastHighlightedElement = lastSelectedElement;
        this.lastHighlightedElementCSS = lastSelectedElementCSS;
        this.currentJQScrollingParent = currentJQScrollingParent;
        this.highlightedElementInterval = null;
        this.isAutomatingNextStep = false;
        this.sideInstructionAutoNextTimer = null;
        this.isMainPopUpCollapsed = false;
    }
}