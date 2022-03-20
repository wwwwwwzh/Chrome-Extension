class SnapshotView {
    static TYPE = {
        RECORDING_STEP: 0,
        RECORING_STEP_OPTION: 1,
        STEP_FROM_OTHER: 2,
        RECORDING_STEP_AND_URL_CONTAINER: 3,
        TUTORIAL_TITLE: 4
    }

    static getViewHTML(content) {
        switch (content.type) {
            case SnapshotView.TYPE.RECORING_STEP_OPTION:
                return `
                    <div id="${content.id}" class="step-option-snapshot-container w-horizontal-scroll-item-container">
                        <!-- snapshot -->
                        <label class="step-option-snapshot-name-label">${content.name ?? ''}</label>
                    </div>
                    `
            case SnapshotView.TYPE.RECORDING_STEP_AND_URL_CONTAINER:
                return `
                    <div class="w-recording-panel-steps-section-container w-horizontal-scroll-item-container">
                        <div class="w-recording-panel-steps-page-indicator-container">
                        ${safeString(content.url, globalCache.currentUrl)}
                        </div>
                        <div class="w-horizontal-scroll-item-container w-horizontal-scroll-container">
                            <div id="${content.id}" class="w-horizontal-scroll-item-container w-horizontal-scroll-container w-recording-panel-steps-step-indicator-container">
                                <div class="step-snapshot-container w-horizontal-scroll-item-container">
                                    <!-- snapshot -->
                                    <label class="step-snapshot-name-label">${safeString(content.name, 'Step Name')}</label>
                                </div>
                                <div class="w-horizontal-scroll-item-next-indicator-container w-horizontal-scroll-item-container">
                                    <div class="w-horizontal-scroll-item-next-indicator"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `
            case SnapshotView.TYPE.TUTORIAL_TITLE:
                return `<div class="w-horizontal-scroll-item-container w-horizontal-scroll-container w-recording-panel-steps-step-indicator-container">
                            <div class="step-snapshot-container w-horizontal-scroll-item-container">
                                <label class="tutorial-title-snapshot-name-label">${safeString(content.name, 'Tutorial Name')}</label>
                            </div>
                        </div>`
            default:
                return `<div id="${content.id}" class="w-horizontal-scroll-item-container w-horizontal-scroll-container w-recording-panel-steps-step-indicator-container">
                            <div class="step-snapshot-container w-horizontal-scroll-item-container">
                                <!-- snapshot -->
                                <label class="step-snapshot-name-label">${safeString(content.name, 'Step Name')}</label>
                            </div>
                            <div class="w-horizontal-scroll-item-next-indicator-container w-horizontal-scroll-item-container">
                                <div class="w-horizontal-scroll-item-next-indicator">
                                </div>
                            </div>
                        </div>`
        }

    }

    // static addHoverListener(id, type) {
    //     switch (type) {
    //         case SnapshotView.TYPE.RECORDING_STEP:
    //             SnapshotView.#addHoverListnerForRecordingStep(id)
    //             break;
    //         default:
    //             break;
    //     }
    // }

    // static #addHoverListnerForRecordingStep(id) {
    //     const element = document.getElementById(id)
    //     element.addEventListener("mouseenter", () => {
    //         const step = TutorialsModel.getCurrentTutorial().steps[SnapshotView.getSnapshotIndex(id)]
    //         step.actionType && Highlighter.highlight(Step.getPath(step))
    //     })
    //     element.addEventListener("mouseleave", () => {
    //         Highlighter.removeLastHighlight()
    //     })
    // }

    // static addClickListener(id, clickEventHandler) {
    //     const element = document.getElementById(id)
    //     element.addEventListener('click', (e) => {
    //         clickEventHandler(id)
    //     })
    // }



    static getSnapshotIndex(id) {
        var stepIndex = -1
        TutorialsModel.getCurrentTutorial().steps.forEach((step, index) => {
            if (step.id === id) stepIndex = index
        })
        return stepIndex
    }
}