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
            DialogBox.present(`Missing step name at step ${step.index + 1}`)
            return false
        }
        return RecorderTutorialCompletionChecker.isActionObjectComplete(step)
    }

    static isActionObjectComplete(step) {
        c('step:' + step)
        const actionObject = { ...step.actionObject, stepIndex: step.index }
        return Step.callFunctionOnActionType(step.actionType,
            () => { RecorderTutorialCompletionChecker.isClickActionComplete(actionObject) },
            null,
            () => { RecorderTutorialCompletionChecker.isInputActionComplete(actionObject) },
            () => { RecorderTutorialCompletionChecker.isRedirectActionComplete(actionObject) },
            null,
            () => { RecorderTutorialCompletionChecker.isSideInstructionActionComplete(actionObject) })
    }

    static isClickActionComplete(clickAction) {
        c('clickAction' + clickAction)
        const stepIndex = clickAction.stepIndex
        const clicks = clickAction.clicks
        if (isArrayEmpty(clicks)) {
            DialogBox.present(`Missing action at step ${stepIndex}`)
            return false
        }
        if (clicks.length === 1) {
            return RecorderTutorialCompletionChecker.isClickGuideComplete(clicks[0], false)
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
        c('clickGuide' + clickGuide)
        if (mandatoryName) {
            if (isStringEmpty(clickGuide.name)) {
                DialogBox.present(`Missing name for click option ${clickGuide.optionIndex} at step ${clickGuide.stepIndex}`)
                return false
            }
        }
        if (isArrayEmpty(clickGuide.path)) {
            DialogBox.present(`Missing element to click for click option ${clickGuide.optionIndex} at step ${clickGuide.stepIndex}`)
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
