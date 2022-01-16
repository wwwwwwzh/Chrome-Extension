


/**
 * Placeholder action class for initialization of step object
 */
class NullAction {

}

class RedirectAction {
    constructor(url) {
        this.url = url;
    }

    static getPath() {
        return null
    }

    static isRedirectCompleted(redirect) {
        return (isNotNull(redirect.url));
    }
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

    static getPath(actionObject) {
        return actionObject.defaulvtClick.path
    }

    static isClickActionCompleted(click) {
        return isClickGuideCompleted(click.defaultClick);
    }
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

    static getPath(actionObject) {
        return actionObject.path
    }

    static isClickGuideCompleted(clickGuide) {
        return (
            isNotNull(clickGuide) &&
            isNotNull(clickGuide.path) &&
            clickGuide.path.length > 0 &&
            clickGuide.name !== null &&
            clickGuide.name !== "" &&
            isNotNull(clickGuide.isRedirect))
    }
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

    static getPath(actionObject) {
        return actionObject.path
    }

    static isInputCompleted(input) {
        return (isNotNull(input.path) && input.path !== [] && isNotNull(input.defaultText) && input.inputType !== "");
    }
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

    static getPath(actionObject) {
        return actionObject.path
    }

    static isSelectCompleted(select) {
        return (isNotNull(select.path) && select.path !== [] && select.defaultValue !== "")
    }
}




class SideInstructionAction {
    constructor(path) {
        this.path = path;
    }

    static getPath(actionObject) {
        return actionObject.path
    }

    static isSideInstructionCompleted(si) {
        return (isNotNull(si.path) && si.path !== [])
    }
}



class UserEventListnerHandler {
    /**
     * Set by specific view controllers.
     * Should contain variables: 
     * And methods: onClick(), checkIfShouldProcessEvent(event), checkIfShouldPreventDefault(event)
     */
    static userEventListnerHandlerDelegate
    static isLisentingRecording = false;
    static isLisentingFollowing = false;
    static isAutomationInterrupt = false;
    static isOnRightPage = true;
    static tutorialStatusCache = VALUES.TUTORIAL_STATUS.BEFORE_INIT_NULL;

    static setTutorialStatusCache(tutorialStatusCache) {
        syncStorageSet(VALUES.TUTORIAL_STATUS.STATUS, tutorialStatusCache);
        UserEventListnerHandler.tutorialStatusCache = tutorialStatusCache;
        UserEventListnerHandler.#onChange();
    }

    static setIsAutomationInterrupt(isAutomationInterrupt) {
        UserEventListnerHandler.isAutomationInterrupt = isAutomationInterrupt;
        UserEventListnerHandler.#onChange();
    }

    static setIsOnRightPage(isOnRightPage) {
        UserEventListnerHandler.isOnRightPage = isOnRightPage;
        UserEventListnerHandler.#onChange();
    }

    static #addGlobalEventListenersWhenRecording() {
        $('*').on('blur focus focusin focusout load resize scroll unload dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error',
            UserEventListnerHandler.#preventDefaultHelper);
        $('*').on('click', UserEventListnerHandler.#onClickHelper);
    }

    static #onChange() {
        //add or remove when recording or not recording
        if (UserEventListnerHandler.tutorialStatusCache === VALUES.TUTORIAL_STATUS.IS_RECORDING) {
            if (!UserEventListnerHandler.isLisentingRecording) {
                UserEventListnerHandler.#addGlobalEventListenersWhenRecording();
                UserEventListnerHandler.isLisentingRecording = true;
            }
        } else {
            if (UserEventListnerHandler.isLisentingRecording) {
                UserEventListnerHandler.#removeGlobalEventListenersWhenRecording();
                UserEventListnerHandler.isLisentingRecording = false;
            }
        }

        if (UserEventListnerHandler.isOnRightPage && (UserEventListnerHandler.isAutomationInterrupt || (UserEventListnerHandler.tutorialStatusCache === VALUES.TUTORIAL_STATUS.IS_MANUALLY_FOLLOWING_TUTORIAL))) {
            if (!UserEventListnerHandler.isLisentingFollowing) {
                UserEventListnerHandler.#addGlobalEventListenersWhenFollowing();
                UserEventListnerHandler.isLisentingFollowing = true;
            }
        } else {
            if (UserEventListnerHandler.isLisentingFollowing) {
                UserEventListnerHandler.#removeGlobalEventListenersWhenFollowing();
                UserEventListnerHandler.isLisentingFollowing = false;
            }
        }
    }

    static #removeGlobalEventListenersWhenRecording() {
        $('*').off('blur focus focusin focusout load resize scroll unload dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error',
            UserEventListnerHandler.#preventDefaultHelper);
        $('*').off('click', UserEventListnerHandler.#onClickHelper);
    }

    static #addGlobalEventListenersWhenFollowing() {
        $('*').on('click', UserEventListnerHandler.#onClickHelper);
    }

    static #removeGlobalEventListenersWhenFollowing() {
        $('*').off('click', UserEventListnerHandler.#onClickHelper);
    }

    static removeAllListners() {
        UserEventListnerHandler.#removeGlobalEventListenersWhenFollowing();
        UserEventListnerHandler.#removeGlobalEventListenersWhenRecording();
    }

    static #onClickHelper(event) {
        UserEventListnerHandler.#preventDefaultHelper(event);
        if (UserEventListnerHandler.userEventListnerHandlerDelegate.checkIfShouldProcessEvent(event)) {
            UserEventListnerHandler.#processEventHelper(event.target);
        }
    }

    static #processEventHelper(target) {
        globalCache.domPath = getShortDomPathStack(target);
        if ($(jqueryElementStringFromDomPath(globalCache.domPath)).length > 1) {
            globalCache.domPath = getCompleteDomPathStack(target);
        }
        console.log(`clicking: ${globalCache.domPath}`);
        globalCache.currentElement = target;
        UserEventListnerHandler.#onClickUniversalHandler();
    }

    static #preventDefaultHelper(event) {
        if (UserEventListnerHandler.userEventListnerHandlerDelegate.checkIfShouldPreventDefault(event)) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false
        }
    }

    static async #onClickUniversalHandler() {
        UserEventListnerHandler.userEventListnerHandlerDelegate.onClick()
    }
}

class GlobalCache {
    constructor() {
        this.interval = 2000,
            this.domPath = null,
            this.currentElement = null,
            this.reHighlightAttempt = 0,
            this.currentUrl = $(location).attr('href');
        this.currentURLObj = new URL(this.currentUrl);
    }


}