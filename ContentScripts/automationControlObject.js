class AutomationControlObject {

    areThereChoices

    /**
     * [{index, optionIndex?}]
     */
    automationChoices = []

    constructor(tutorial) {
        this.tutorial = tutorial
        tutorial.steps.forEach((step, index) => {
            const actionObject = step.actionObject
            Step.callFunctionOnActionType(step.actionType, () => {
                if (actionObject.clicks.length > 1) {
                    this.automationChoices.push({ index })
                }
            }, () => {
                if (actionObject.clicks.length > 1) {
                    this.automationChoices.push({ index })
                }
            },
                () => {
                    if (actionObject.inputTexts.length > 1) {
                        this.automationChoices.push({ index })
                    }
                })
        })
        if (isArrayEmpty(this.automationChoices)) {
            this.areThereChoices = false
        } else {
            this.areThereChoices = true
        }
    }

    selectOptionAtChoice(choiceIndex, optionIndex) {
        this.automationChoices[choiceIndex].optionIndex = optionIndex
    }

    isAllOptionsChosen() {
        var result = true
        this.automationChoices.forEach((choice, index) => {
            if (!isNotNull(choice.optionIndex)) {
                result = false
            }
        })
        return result
    }

    // #constructClickChoices(clickAction) {

    // }

    // #constructInputChoices(inputAction) {

    // }

}
