class DialogBox {
    constructor() {
        this.#initializeUI()
    }

    #initializeUI() {
        $('body').append(`
        
        `);
    }

    #deinitializeUI() {

    }

    deinitialize() {
        this.#deinitializeUI()
    }
}