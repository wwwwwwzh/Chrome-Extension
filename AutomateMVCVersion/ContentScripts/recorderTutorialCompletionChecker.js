class RecorderTutorialCompletionChecker {
    static isTutorialComplete() {
        const tutorial = TutorialsModel.getCurrentTutorial()
        if (isStringEmpty(tutorial.name)) {
            DialogBox.present("Missing tutorial name")
            return false
        }
        var areStepsComplete = true
        const steps = tutorial.steps
        for (let index = 0; index < steps.length; index++) {
            areStepsComplete = RecorderTutorialCompletionChecker.isStepComplete(steps[index])
            if (!areStepsComplete) break
        }
        return areStepsComplete
    }

    static isStepComplete(step) {
        if (isStringEmpty(step.name)) {
            DialogBox.present(`Missing step name at step ${addOne(step.index)}`)
            return false
        }
        return RecorderTutorialCompletionChecker.isActionObjectComplete(step)
    }

    static isActionObjectComplete(step) {
        const actionObject = { ...step.actionObject, stepIndex: step.index }
        return Step.callFunctionOnActionType(step.actionType,
            () => { return RecorderTutorialCompletionChecker.isClickActionComplete(actionObject) },
            null,
            () => { return RecorderTutorialCompletionChecker.isInputActionComplete(actionObject) },
            () => { return RecorderTutorialCompletionChecker.isRedirectActionComplete(actionObject) },
            null,
            () => { return RecorderTutorialCompletionChecker.isSideInstructionActionComplete(actionObject) })
    }

    static isClickActionComplete(clickAction) {
        var { clicks, stepIndex } = clickAction
        if (isArrayEmpty(clicks)) {
            DialogBox.present(`Missing action at step ${addOne(stepIndex)}`)
            return false
        }
        if (clicks.length === 1) {
            var click = clicks[0]
            click.optionIndex = 0
            click.stepIndex = stepIndex
            return RecorderTutorialCompletionChecker.isClickGuideComplete(click, false)
        }
        var areClicksComplete = true
        for (let index = 0; index < clicks.length; index++) {
            var click = clicks[index];
            click.optionIndex = index
            click.stepIndex = stepIndex
            areClicksComplete = RecorderTutorialCompletionChecker.isClickGuideComplete(click)
            if (!areClicksComplete) break
        }
        return areClicksComplete
    }

    static isClickGuideComplete(clickGuide, mandatoryName = true) {
        if (mandatoryName) {
            if (isStringEmpty(clickGuide.name)) {
                DialogBox.present(`Missing name for click option ${addOne(clickGuide.optionIndex)} at step ${addOne(clickGuide.stepIndex)}`)
                return false
            }
        }
        if (isArrayEmpty(clickGuide.path)) {
            DialogBox.present(`Missing element to click for click option ${addOne(clickGuide.optionIndex)} at step ${addOne(clickGuide.stepIndex)}`)
            return false
        }
        return true
    }

    static isInputActionComplete(inputAction) {

    }

    static isSideInstructionActionComplete(sideInstructionAction) {

    }

    static isRedirectActionComplete(redirectAction) {

    }
}
