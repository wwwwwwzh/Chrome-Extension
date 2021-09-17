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
     * @param {RedirectAction | ClickAction | InputAction | SelectAction, NullAction} actionObject 
     */
    constructor(index, actionType, actionObject, name, description) {
        this.index = index;
        this.actionType = actionType;
        this.actionObject = actionObject;
        this.name = name;
        this.description = description;
    }

    completed() {
        return (this.actionObject.completed() && this.index !== null && this.actionType !== VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL && typeof this.actionObject !== 'NullAction')
    }
}

function isStepCompleted(step) {
    return ((
        isRedirectCompleted(step.actionObject) ||
        isClickActionCompleted(step.actionObject) ||
        isInputCompleted(step.actionObject) ||
        isSelectCompleted(step.actionObject)) && step.index !== null && step.actionType !== VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_NULL && typeof step.actionObject !== 'NullAction')
}

//Step Action Objects
// class ClickAndRedirectAction {
//     /**
//      * 
//      * @param {CAR} defaultCAR 
//      * @param {[CAR]} options 
//      */
//     constructor(defaultCAR, options) {
//         this.defaultCAR = defaultCAR;
//         this.options = options;
//     }
// }

// class CAR {
//     /**
//      * Click and redirect object used in ClickAndRedirectAction
//      * @param {[string]} path 
//      * @param {string} url 
//      */
//     constructor(path, url) {
//         this.path = path;
//         this.url = url;
//     }
// }

/**
 * Placeholder action class for initialization of step object
 */
class NullAction {

}

class RedirectAction {
    constructor(url) {
        this.url = url;
    }

    completed() {
        return (this.url !== null && typeof this.url !== 'undefined');
    }
}

function isRedirectCompleted(redirect) {
    return (redirect.url !== null && typeof redirect.url !== 'undefined');
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

    completed() {
        return this.defaultClick.completed();
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
    constructor(path, name, description, isRedirect, url) {
        this.path = path;
        this.name = name;
        this.description = description;
        this.isRedirect = isRedirect;
        this.url = url;
    }

    completed() {
        return (this.path !== null && this.path !== [] && this.name !== null && this.name !== "" && typeof this.isRedirect !== 'undefined')
    }
}

function isClickGuideCompleted(clickGuide) {
    return (typeof clickGuide !== 'undefined' && clickGuide.path !== null && clickGuide.path !== [] && clickGuide.name !== null && clickGuide.name !== "" && typeof clickGuide.isRedirect !== 'undefined')
}

class InputAction {
    /**
     * 
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

    completed() {
        return (this.path !== null && this.path !== [] && this.defaultText !== null && this.inputType !== "")
    }
}

function isInputCompleted(input) {
    return (input.path !== null && input.path !== [] && input.defaultText !== null && input.inputType !== "");
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

    completed() {
        return (this.path !== null && this.path !== [] && this.defaultValue !== "")
    }
}

function isSelectCompleted(select) {
    return (select.path !== null && select.path !== [] && select.defaultValue !== "")
}