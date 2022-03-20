class HighlightInstructionViewController {
    static #highlightInstructionWindows = null

    static present(title, message) {
        $('body').append(`
        <div id="w-highlight-instruction-window" class="w-highlight-instruction-window">
            <h3 id="w-popup-step-name" class="w-following-tutorial-item">${title}</h3>
            <p id="w-popup-step-description" class="w-following-tutorial-item">${message}</p>
        </div>
        `);

        HighlightInstructionViewController.#highlightInstructionWindows = document.getElementsByClassName('w-highlight-instruction-window')
    }
}