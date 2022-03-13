class AutomationChoicesViewController {
    automationControlObject
    allItemsAdded = []
    constructor(automationChoicesViewControllerDelegate) {
        this.automationChoicesViewControllerDelegate = automationChoicesViewControllerDelegate
        this.#constructAutomationControlObject()

        if (this.automationControlObject.areThereChoices) {
            this.#initializeUI()
        }
    }

    #constructAutomationControlObject() {
        this.automationControlObject = new AutomationControlObject(TutorialsModel.getCurrentTutorial())
    }

    #initializeUI() {
        this.automationControlObject.automationChoices.forEach((choice, choiceIndex) => {
            const step = TutorialsModel.getCurrentTutorial().steps[choice.index]
            this.automationChoicesViewControllerDelegate.mainPopupScrollArea.append(`
                <div class="w-workflow-list-cell" id="automation-choice-${choiceIndex}">
                    <div class="w-workflow-list-cell-upper-container">
                        <div class="w-workflow-list-cell-attribute-icon"></div>
                        <div class="w-workflow-list-cell-name">${step.name}</div>
                    </div>
                </div>
            `);

            const item = document.getElementById(`automation-choice-${choiceIndex}`)
            this.allItemsAdded.push(item)
            const original = item.innerHTML
            const cellMouseEnterBinded = cellMouseEnter.bind(this)
            const cellMouseLeaveBinded = cellMouseLeave.bind(this)
            item.addEventListener('mouseenter', cellMouseEnterBinded)
            item.addEventListener('mouseleave', cellMouseLeaveBinded)

            function cellMouseEnter(event) {
                if (item.innerHTML === original) {
                    var options
                    if (step.actionType === VALUES.STEP_ACTION_TYPE.STEP_ACTION_TYPE_CLICK) {
                        options = step.actionObject.clicks
                        options.forEach((option, optionIndex) => {
                            $(item).append(`
                                        <div class="w-workflow-list-cell w-automation-choices-choice-button" id="automation-option-${choiceIndex}-${optionIndex}">
                                            <div class="w-workflow-list-cell-upper-container">
                                                <div class="w-workflow-list-cell-attribute-icon"></div>
                                                <div class="w-workflow-list-cell-name">${option.name}</div>
                                            </div>
                                        </div>
                                    `)
                            const optionItem = document.getElementById(`automation-option-${choiceIndex}-${optionIndex}`)
                            optionItem.addEventListener('click', (e) => {
                                this.automationControlObject.selectOptionAtChoice(choiceIndex, optionIndex)
                                $(item).children().each((index, ele) => {
                                    if (index !== 0 && index !== optionIndex + 1) {
                                        $(ele).hide()
                                    }
                                })
                            })
                        })
                    } else {
                        options = step.actionObject.inputTexts
                        options.forEach((option, optionIndex) => {
                            $(item).append(`
                            <button class="w-automation-choices-choice-button">${option}</button>
                            `)
                        })
                    }

                } else {
                    $(item).children().show()
                }
            }

            function cellMouseLeave(event) {
                const container = $(event.target)
                const choiceIndex = container.attr('id').split('-')[2]
                $(event.target).children().each((index, ele) => {
                    if (index !== 0 && index != this.automationControlObject.automationChoices[choiceIndex].optionIndex + 1) {
                        $(ele).hide()
                    }
                })
            }
        })

    }

    isAllOptionsChosen() {
        return this.automationControlObject.isAllOptionsChosen()
    }

    #deinitializeUI() {
        this.allItemsAdded.forEach(item => {
            item.remove()
        })
    }

    dismiss() {
        this.automationChoicesViewControllerDelegate = null
        this.#deinitializeUI()
    }
}