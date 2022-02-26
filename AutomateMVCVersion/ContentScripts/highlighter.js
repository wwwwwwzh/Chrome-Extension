

class Highlighter {
    static HIGHLIGHT_TYPES = {
        BASIC: 0b000,
        ALERT: 0b001,
        SCROLL: 0b010,
        SCROLL_AND_ALERT: 0b011,
    }

    static #ALERT_MASK = 0b001
    static #SCROLL_MASK = 0b010

    //local variables
    static #reHighlightTimer = null
    static #currentJQScrollingParent = null
    static #alertElementInterval = null

    /**
     * useInstructionWindow: Bool, 
     * 
     * highlightInstructionWindow: JQuery object
     * 
     * updateStepInstructionUIHelper()
     * 
     * highlightedElementNotFoundHandler()
     */
    static highlighterViewControllerSpecificUIDelegate

    static highlight(element, removeLastHighlight = true, type = Highlighter.HIGHLIGHT_TYPES.BASIC, callback = () => { }) {
        if (!isNotNull(element) || element?.length < 1) return;
        c('Highlighting:' + element + '|removeLastHighlight:' + removeLastHighlight + '|type:' + type)
        var jQElement = element
        //get jQElement from path array
        if (Array.isArray(element)) {
            jQElement = getjQElementFromPathAndNullCheck();
            if (!checkIfNeedToHighlight()) return;
        }

        highlightHelper()

        function highlightHelper() {
            removeLastHighlight && Highlighter.removeLastHighlight();
            jQElement.addClass('w-highlight-box w-highlight-box-specifier');
            (Highlighter.#ALERT_MASK & type) && Highlighter.#alertElement(jQElement);
            (Highlighter.#SCROLL_MASK & type) && Highlighter.#scrollToElement(jQElement, callback)
            Highlighter.highlighterViewControllerSpecificUIDelegate.useInstructionWindow && Highlighter.#updateHighlightInstructionWindow(jQElement);
        }

        function getjQElementFromPathAndNullCheck() {
            //TODO: regex path may highlight multiple elements, show all or what
            const jQElementToHighlight = $(jqueryElementStringFromDomPath(element));
            if (element !== null) {
                if (!(isNotNull(jQElementToHighlight[0]) && jQElementToHighlight.css('display') !== 'none')) {
                    //element not found
                    Highlighter.highlighterViewControllerSpecificUIDelegate.useInstructionWindow && Highlighter.highlighterViewControllerSpecificUIDelegate.highlightInstructionWindow.hide();

                    if (globalCache.reHighlightAttempt > 5) {
                        //stop refinding element
                        console.error("ELEMENT NOT FOUND");
                        Highlighter.#reHighlightTimer = null;
                        Highlighter.highlighterViewControllerSpecificUIDelegate.highlightedElementNotFoundHandler();
                        return null;
                    }
                    globalCache.reHighlightAttempt++;
                    Highlighter.#reHighlightTimer = setTimeout(() => {
                        Highlighter.highlight(element, removeLastHighlight, type, callback);
                    }, 200);
                    return null;
                }
                globalCache.reHighlightAttempt = 0;
                Highlighter.#clearRehighlightTimer();
                return jQElementToHighlight;
            } else {
                return null
            }
        }

        function checkIfNeedToHighlight() {
            if (!isNotNull(jQElement)) return false;
            if (Highlighter.#ALERT_MASK & type) {
                if ($(jQElement).is(':animated')) {
                    if (isNotNull(jQElement.attr("class")) && arrayContains(jQElement.attr("class").split(/\s+/), ['w-highlight-box', 'w-highlight-box-specifier'])) return false;
                }
            } else {
                if (!$(jQElement).is(':animated')) {
                    if (isNotNull(jQElement.attr("class")) && arrayContains(jQElement.attr("class").split(/\s+/), ['w-highlight-box', 'w-highlight-box-specifier'])) return false;
                }
            }

            return true
        }
    }

    static #scrollToElement(jQElementToHighlight, callback) {
        Highlighter.#currentJQScrollingParent = $(getScrollParent(jQElementToHighlight[0], false));
        var offset = 0;
        const eleOffset = jQElementToHighlight.offset();
        const scrollParentOffset = Highlighter.#currentJQScrollingParent.offset();
        if (isNotNull(eleOffset) && isNotNull(scrollParentOffset)) {
            offset = parseInt(eleOffset.top) - parseInt(scrollParentOffset.top) - window.innerHeight / 2
        }
        Highlighter.#currentJQScrollingParent.animate({
            scrollTop: `+=${offset}px`
        }, globalCache.interval).promise().then(() => {
            callback();
        })
    }



    static #clearRehighlightTimer() {
        isNotNull(Highlighter.#reHighlightTimer) && clearTimeout(Highlighter.#reHighlightTimer);
        Highlighter.#reHighlightTimer = null;
    }

    static #alertElement(element) {
        var perAnimationBorderLoopCount = 0;

        borderOut();

        Highlighter.#alertElementInterval = setInterval(() => {
            element.stop();
            element.removeAttr('style');
            borderOut();
        }, 3500);

        function borderOut() {
            element.animate({
                boxShadow: '0px 0px 3px 6px rgba(255, 60, 43, 1)',
            }, 300).promise().then(() => {
                borderIn();
            });
        }

        function borderIn() {
            element.animate({
                boxShadow: '0px 0px 3px 6px rgba(255, 200, 42, 1)',
            }, 300).promise().then(() => {
                if (perAnimationBorderLoopCount++ < 2) {
                    borderOut();
                } else {
                    element.stop();
                    element.removeAttr('style');
                    perAnimationBorderLoopCount = 0;
                }
            });
        }
    }

    static removeLastHighlight() {
        //stop timers and animations
        Highlighter.#clearRehighlightTimer()
        isNotNull(Highlighter.#currentJQScrollingParent) && Highlighter.#currentJQScrollingParent.stop();
        Highlighter.#currentJQScrollingParent = null;
        clearInterval(Highlighter.#alertElementInterval);
        Highlighter.#alertElementInterval = null;

        const highlightedElements = $('.w-highlight-box.w-highlight-box-specifier');
        highlightedElements.stop(true);
        highlightedElements.removeAttr('style');
        highlightedElements.removeClass('w-highlight-box w-highlight-box-specifier');
    }

    static #updateCount = 0;
    static #lastHighlightedElement = null
    static #lastHighlightedElementUpdateTimeout = null
    //TODO: seperate instruction window from highlighter
    static #updateHighlightInstructionWindow(element) {
        if (Highlighter.#lastHighlightedElement !== element || Highlighter.highlighterViewControllerSpecificUIDelegate.highlightInstructionWindow.is(":hidden")) {
            //highlighting new element or no longer lighlighting, remove previous highlight attempt
            Highlighter.#lastHighlightedElementUpdateTimeout && clearTimeout(Highlighter.#lastHighlightedElementUpdateTimeout)
            if (element === Highlighter.#lastHighlightedElement) {
                //no longer highlighting but timer tries to come in, remove and return
                return
            }
        }

        const layout = getInstructionWindowLayout(element);
        Highlighter.highlighterViewControllerSpecificUIDelegate.highlightInstructionWindow.css(layout.css);
        Highlighter.highlighterViewControllerSpecificUIDelegate.movePopupIfOverlap(layout);
        Highlighter.highlighterViewControllerSpecificUIDelegate.updateStepInstructionUIHelper();

        if (Highlighter.#updateCount < 2) {
            Highlighter.#lastHighlightedElementUpdateTimeout = setTimeout(() => {
                Highlighter.#updateHighlightInstructionWindow(element);
            }, 200);
            Highlighter.#updateCount++;
        } else {
            Highlighter.#updateCount = 0;
        }

        Highlighter.highlighterViewControllerSpecificUIDelegate.highlightInstructionWindow.show();
        Highlighter.#lastHighlightedElement = element
    }
}