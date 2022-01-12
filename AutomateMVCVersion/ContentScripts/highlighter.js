class Highlighter {

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

    static highlightAndScollTo(path, isRemoveLastHighlight = true, callback = () => { }) {
        isRemoveLastHighlight && this.removeLastHighlight();
        const jQElementToHighlight = this.#highlightElementNullCheck(path, callback);

        if (!isNotNull(jQElementToHighlight)) return;
        if (isNotNull(jQElementToHighlight.attr("class")) && arrayContains(jQElementToHighlight.attr("class").split(/\s+/), ['w-highlight-box', 'w-highlight-box-specifier'])) return;

        this.highlight(jQElementToHighlight);
        this.highlighterViewControllerSpecificUIDelegate.useInstructionWindow && this.#updateHighlightInstructionWindow(jQElementToHighlight);

        this.#scrollToElement(jQElementToHighlight, callback)
    }

    static #scrollToElement(jQElementToHighlight, callback) {
        globalCache.currentJQScrollingParent = $(getScrollParent(jQElementToHighlight[0], false));
        var offset = 0;
        const eleOffset = jQElementToHighlight.offset();
        const scrollParentOffset = globalCache.currentJQScrollingParent.offset();
        if (isNotNull(eleOffset) && isNotNull(scrollParentOffset)) {
            offset = parseInt(eleOffset.top) - parseInt(scrollParentOffset.top) - window.innerHeight / 2
        }
        globalCache.currentJQScrollingParent.animate({
            scrollTop: `+=${offset}px`
        }, globalCache.interval).promise().then(() => {
            callback();
        })
    }

    static #highlightElementNullCheck(path, callback) {
        //TODO: regex path may highlight multiple elements, show all or what
        const jQElementToHighlight = $(jqueryElementStringFromDomPath(path));
        console.log('jQElementToHighlight:' + JSON.stringify(jQElementToHighlight))
        if (path !== null) {
            if (!(isNotNull(jQElementToHighlight[0]) && jQElementToHighlight.css('display') !== 'none')) {
                //element not found
                Highlighter.highlighterViewControllerSpecificUIDelegate.useInstructionWindow && this.highlighterViewControllerSpecificUIDelegate.highlightInstructionWindow.hide();

                if (globalCache.reHighlightAttempt > 5) {
                    //stop refinding element
                    console.error("ELEMENT NOT FOUND");
                    globalCache.reHighlightTimer = null;
                    Highlighter.highlighterViewControllerSpecificUIDelegate.highlightedElementNotFoundHandler();
                    return null;
                }
                globalCache.reHighlightAttempt++;
                globalCache.reHighlightTimer = setTimeout(() => {
                    Highlighter.highlightAndScollTo(path, callback);
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

    static #clearRehighlightTimer() {
        isNotNull(globalCache.reHighlightTimer) && clearTimeout(globalCache.reHighlightTimer);
        globalCache.reHighlightTimer = null;
    }


    static highlight(jQElement) {
        jQElement.addClass('w-highlight-box w-highlight-box-specifier');
        this.#alertElement(jQElement);
    }

    static #alertElement(element) {
        var perAnimationBorderLoopCount = 0;

        borderOut();

        globalCache.alertElementInterval = setInterval(() => {
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
        this.#clearRehighlightTimer()
        isNotNull(globalCache.currentJQScrollingParent) && globalCache.currentJQScrollingParent.stop();
        globalCache.currentJQScrollingParent = null;
        clearInterval(globalCache.alertElementInterval);
        globalCache.alertElementInterval = null;

        const highlightedElements = $('.w-highlight-box.w-highlight-box-specifier');
        highlightedElements.stop(true);
        highlightedElements.removeAttr('style');
        highlightedElements.removeClass('w-highlight-box w-highlight-box-specifier');
    }

    static highlightAndRemoveLastHighlight(jQElement) {
        this.removeLastHighlight()
        this.highlight(jQElement);
    }



    static #updateCount = 0;

    static #updateHighlightInstructionWindow(element) {
        const tutorialsManager = TutorialsModel
        const stepName = tutorialsManager.getCurrentStep().name;
        const stepDescription = tutorialsManager.getCurrentStep().description;

        if (isNotNull(stepName) || isNotNull(stepDescription)) {
            this.highlighterViewControllerSpecificUIDelegate.highlightInstructionWindow.show();
            const layout = getInstructionWindowLayout(element);
            //console.log(layout);
            this.highlighterViewControllerSpecificUIDelegate.highlightInstructionWindow.css(layout.css);
            movePopupIfOverlap(Highlighter.highlighterViewControllerSpecificUIDelegate.mainPopUpContainer, Highlighter.highlighterViewControllerSpecificUIDelegate.highlightInstructionWindow);
            this.highlighterViewControllerSpecificUIDelegate.updateStepInstructionUIHelper();
            if (this.#updateCount === 0) {
                setTimeout(() => {
                    Highlighter.#updateHighlightInstructionWindow(element);
                }, 200);
                this.#updateCount++;
            } else {
                this.#updateCount = 0;
            }
        } else {

        }
    }
}