class SnapshotView {
    static TYPE = {
        RECORDING_STEP: 0,
        RECORING_STEP_OPTION: 1,
        STEP_FROM_OTHER: 2
    }

    static getViewHTML(content) {
        switch (content.type) {
            case SnapshotView.TYPE.RECORING_STEP_OPTION:
                return {
                    snapshot: `
                    <div id="${content.id}" class="option-snapshot-container w-horizontal-scroll-item-container">
                        <!-- snapshot -->
                        <label class="option-snapshot-name-label">${content.name ?? ''}</label>
                    </div>
                    `}

            default:
                return `<div id="${content.id}" class="w-horizontal-scroll-item-container w-horizontal-scroll-container w-recording-panel-steps-step-indicator-container">
                            <div class="step-snapshot-container w-horizontal-scroll-item-container">
                                <!-- snapshot -->
                                <label for="">${content.name ?? ''}</label>
                                <label for="">${content.description ?? ''}</label>
                            </div>
                            <div class="w-horizontal-scroll-item-next-indicator-container w-horizontal-scroll-item-container">
                                <div class="w-horizontal-scroll-item-next-indicator">
                                </div>
                            </div>
                        </div>`
        }

    }

    static addHoverListener(id, type) {
        switch (type) {
            case SnapshotView.TYPE.RECORDING_STEP:
                SnapshotView.#addHoverListnerForRecordingStep(id)
                break;
            default:
                break;
        }
    }

    static #addHoverListnerForRecordingStep(id) {
        const element = document.getElementById(id)
        element.addEventListener("mouseenter", () => {
            const step = TutorialsModel.getCurrentTutorial().steps[SnapshotView.getSnapshotIndex(id)]
            step.actionType && Highlighter.highlight(Step.getPath(step))
        })
        element.addEventListener("mouseleave", () => {
            Highlighter.removeLastHighlight()
        })
    }

    static addClickListener(id, clickEventHandler) {
        const element = document.getElementById(id)
        element.addEventListener('click', (e) => {
            clickEventHandler(id)
        })
    }



    static getSnapshotIndex(id) {
        return getElementIndex(document.getElementById(id))
    }
}