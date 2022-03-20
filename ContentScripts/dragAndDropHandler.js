class DragAndDropHandler {
    static #dragOffsetX = 0
    static #dragOffsetY = 0
    static #elementToDrag = null
    static #isDraggingStarted = false
    static dropHandlerDelegate


    static addDragListenerToElement(element) {
        element.addEventListener('mousedown', DragAndDropHandler.#onDragBegins)
    }

    static #onDragBegins(event) {
        const element = event.target
        document.onmousemove = DragAndDropHandler.#onDragging;
        document.onmouseup = DragAndDropHandler.#onDraggingEnds;
        DragAndDropHandler.#dragOffsetY = event.y - element.getBoundingClientRect().top
        DragAndDropHandler.#dragOffsetX = event.x - element.getBoundingClientRect().left
    }

    static #onDragging(event) {

        const element = event.target
        DragAndDropHandler.#preventDefault(event)
        if (!DragAndDropHandler.#isDraggingStarted) {
            DragAndDropHandler.#isDraggingStarted = true;
            if (element.usePlaceholder) {
                DragAndDropHandler.#addPlaceholderElement(event)
            } else {
                DragAndDropHandler.#elementToDrag = element
            }
        } else {
            DragAndDropHandler.#positionElement(event)
            DragAndDropHandler.dropHandlerDelegate?.handleDraggingElementOnDropArea?.(DragAndDropHandler.#elementToDrag, event)
        }
    }

    static #positionElement(event) {
        DragAndDropHandler.#elementToDrag.style.top = `${event.y - DragAndDropHandler.#dragOffsetY}px`
        DragAndDropHandler.#elementToDrag.style.left = `${event.x - DragAndDropHandler.#dragOffsetX}px`
    }

    static #addPlaceholderElement(event) {
        DragAndDropHandler.#elementToDrag = event.target.cloneNode(true)
        DragAndDropHandler.#elementToDrag.classList.add("element-to-drag")
        DragAndDropHandler.#elementToDrag.style.position = 'fixed'
        DragAndDropHandler.#positionElement(event)
        DragAndDropHandler.#elementToDrag.style.zIndex = 2147483647
        document.body.appendChild(DragAndDropHandler.#elementToDrag)
    }

    static #onDraggingEnds(e) {
        const element = e.target
        removePlaceholders(element)
        DragAndDropHandler.dropHandlerDelegate?.handleDrop?.(DragAndDropHandler.#elementToDrag, event)

        function removePlaceholders() {
            document.onmouseup = null;
            document.onmousemove = null;
            DragAndDropHandler.#isDraggingStarted = false
            DragAndDropHandler.#elementToDrag && DragAndDropHandler.#elementToDrag.remove()
        }
    }

    static #preventDefault(e) {
        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();
        e.cancelBubble = true;
        e.returnValue = false;
        return false;
    }
}