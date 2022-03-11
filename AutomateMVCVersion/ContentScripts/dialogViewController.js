class DialogBox {

    static #mdcDialog = null
    static #jQueryDialog = null

    static present(message, title, cancelable = false, mainButtonText = 'OK', mainAction = () => { }) {
        if (DialogBox.#jQueryDialog) return
        $('body').append(`
        <div id="w-dialog-container" style="display: none;">
            <link rel="stylesheet" href="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.css">
            <div class="mdc-dialog">
                <div class="mdc-dialog__container">
                    <div class="mdc-dialog__surface"
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="my-dialog-title"
                    aria-describedby="my-dialog-content">
                    ${title ? `<h2 class="mdc-dialog__title" id="my-dialog-title">${title}</h2>` : ''}
                    <div class="mdc-dialog__content" id="my-dialog-content">
                        ${message}
                    </div>
                    <div class="mdc-dialog__actions">
                        ${cancelable ?
                `<button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="cancel" id="w-dialog-cancel-button">
                            <div class="mdc-button__ripple"></div>
                            <span class="mdc-button__label">Cancel</span>
                        </button>` : ''}
                        <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="discard" id="w-dialog-discard-button">
                            <div class="mdc-button__ripple"></div>
                            <span class="mdc-button__label">${mainButtonText}</span>
                        </button>
                    </div>
                    </div>
                </div>
                <div class="mdc-dialog__scrim"></div>
            </div>
        </div>
        `);

        DialogBox.#mdcDialog = new mdc.dialog.MDCDialog(document.querySelector('.mdc-dialog'));

        DialogBox.#mdcDialog.listen('MDCDialog:closed', () => {
            DialogBox.#jQueryDialog.remove()
            DialogBox.#mdcDialog = null
            DialogBox.#jQueryDialog = null
        })
        DialogBox.#jQueryDialog = $('#w-dialog-container')
        $('#w-dialog-discard-button').on('click', () => {
            mainAction()
        })
        DialogBox.#jQueryDialog.show()
        DialogBox.#mdcDialog.open()

    }
}