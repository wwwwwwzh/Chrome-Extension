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
     * @param {ClickAndRedirectAction | RedirectAction | ClickAction | InputAction | SelectAction} actionObject 
     */
    constructor(index, actionType, actionObject) {
        this.index = index;
        this.actionType = actionType;
        this.actionObject = actionObject;
    }

    constructor(path, index, action_type, description = "", redirect_to = "", input = "") {
        this.path = path;
        this.index = index;
        this.action_type = action_type;
        this.description = description;
        this.redirect_to = redirect_to;
        this.input = input;
    }


};

//Step Action Objects
class ClickAndRedirectAction {
    /**
     * 
     * @param {CAR} defaultCAR 
     * @param {[CAR]} options 
     */
    constructor(defaultCAR, options) {
        this.defaultCAR = defaultCAR;
        this.options = options;
    }
}

class CAR {
    /**
     * Click and redirect object used in ClickAndRedirectAction
     * @param {[string]} path 
     * @param {string} url 
     */
    constructor(path, url) {
        this.path = path;
        this.url = url;
    }
}

class RedirectAction {
    constructor(url) {
        this.url = url;
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
     */
    constructor(path, name, description) {
        this.path = path;
        this.name = name;
        this.description = description
    }
}

class InputAction {
    /**
     * 
     * @param {[string]} path 
     * @param {string} defaultText 
     * @param {[string]} optionsText 
     * @param {boolean} isMandatory 
     * @param {string} inputType 
     */
    constructor(path, defaultText, optionsText, isMandatory, inputType) {
        this.path = path;
        this.defaultText = defaultText;
        this.optionsText = optionsText;
        this.isMandatory = isMandatory;
        this.inputType = inputType;
    }
}

class SelectAction {
    /**
     * 
     * @param {[string]} path 
     * @param {string} defaultValue html value attribute
     * @param {boolean} isMandatory 
     */
    constructor(path, defaultValue, isMandatory) {
        this.path = path;
        this.defaultValue = defaultValue;
        this.isMandatory = isMandatory;
    }
}