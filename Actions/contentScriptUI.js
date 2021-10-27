let mainPopUpContainer;
let mainDraggableArea;
let automationSpeedSlider;
let stopOptionsStopButton;
let popUpAutomateButton;
let popUpManualButton;
let followTutorialOptionsCancelButton;
let popUpStepName;
let popUpStepDescription;
let popUpNextStepButton;
let wrongPageRedirectButton;
let mainCloseButton;

let highlightInstructionWindow;

$(() => {
    //tutorial menu
    $('body').append(
        `
        <div id=\"main-popup-container\">
            <div id=\"main-draggable-area\"  class=\"draggable-area common-item\"></div>
            <input type=\"range\" min=\"1\" max=\"100\" value=\"50\" id=\"automation-speed-slider\" class=\"common-item\">
            <span class=\"close common-item\" id=\"main-close-button\">&times;</span>

            <button id=\"pop-up-automate-button\" class=\"follow-tutorial-options-item\">Automate</button>
            <button id=\"pop-up-manual-button\" class=\"follow-tutorial-options-item\">Walk Me Through</button>
            <button id=\"pop-up-cancel-button\" class=\"follow-tutorial-options-item\">Cancel</button>

            <button id=\"pop-up-next-step-button\" class=\"following-tutorial-item\">Next</button>
            <button id=\"stop-options-stop-button\" class=\"following-tutorial-item\">Stop</button>
            
            <a href="/" id=\"wrong-page-redirect-button\" class=\"wrong-page-item\">You have an ongoing tutorial on [website address]</a>
        </div>
        `
    );
    mainPopUpContainer = $('#main-popup-container');
    mainPopUpContainer.css(CSS.MAIN_POPUP);
    mainPopUpContainer.css(CSS.MAIN_POPUP_START_POSITION);


    mainDraggableArea = $('#main-draggable-area');
    mainDraggableArea.css(CSS.POPUP_DRAGGABLE);
    makeElementDraggable(mainDraggableArea[0], mainPopUpContainer[0]);

    automationSpeedSlider = $('#automation-speed-slider');
    automationSpeedSlider.on('change', () => {
        onAutomationSpeedSliderChanged();
    })

    followTutorialOptionsCancelButton = $('#pop-up-cancel-button');
    followTutorialOptionsCancelButton.css(CSS.BUTTON);
    followTutorialOptionsCancelButton.hover(() => {
        followTutorialOptionsCancelButton.css(CSS.BUTTON_HOVER);
    }, () => {
        followTutorialOptionsCancelButton.css(CSS.BUTTON);
    })

    mainCloseButton = $('#main-close-button')
    mainCloseButton.css(CSS.CLOSE_BUTTON);
    mainCloseButton.hover(() => {
        mainCloseButton.css({ 'background': '#d38600' });
    }, () => {
        mainCloseButton.css({ 'background': 'rgba(0,0,0,0)' });
    })

    mainCloseButton.on("click", () => {
        if (globalCache.isMainPopUpCollapsed) {
            mainPopUpContainer.css(CSS.MAIN_POPUP);
            mainCloseButton.html('&times;');
            mainPopUpContainer.find('.should-reopen').show();
            mainPopUpContainer.find('.should-reopen').removeClass('should-reopen');

            globalCache.isMainPopUpCollapsed = false;
        } else {
            mainPopUpContainer.find(':visible').each((i, element) => {
                $(element).addClass('should-reopen');
            })
            mainPopUpContainer.css(CSS.POPUP_COLLAPSED);
            mainPopUpContainer.children().hide();
            mainCloseButton.html('&plus;');
            mainCloseButton.show();
            mainDraggableArea.show();
            globalCache.isMainPopUpCollapsed = true;
        }
    })

    //stop tutorial options

    stopOptionsStopButton = $('#stop-options-stop-button');
    stopOptionsStopButton.css(CSS.BUTTON);
    stopOptionsStopButton.hover(() => {
        stopOptionsStopButton.css(CSS.BUTTON_HOVER);
    }, () => {
        stopOptionsStopButton.css(CSS.BUTTON);
    })
    stopOptionsStopButton.on('click', () => {
        onStopTutorialButtonClicked();
    });


    //middle popup
    //automate and walk through buttons
    popUpAutomateButton = $("#pop-up-automate-button");
    popUpAutomateButton.css(CSS.BUTTON);
    popUpAutomateButton.hover(() => {
        popUpAutomateButton.css(CSS.BUTTON_HOVER);
    }, () => {
        popUpAutomateButton.css(CSS.BUTTON);
    });
    popUpManualButton = $("#pop-up-manual-button");
    popUpManualButton.css(CSS.BUTTON);
    popUpManualButton.hover(() => {
        popUpManualButton.css(CSS.BUTTON_HOVER);
    }, () => {
        popUpManualButton.css(CSS.BUTTON);
    });

    //guides during tutorial

    popUpNextStepButton = $("#pop-up-next-step-button");
    popUpNextStepButton.css(CSS.BUTTON);
    popUpNextStepButton.hover(() => {
        popUpNextStepButton.css(CSS.BUTTON_HOVER);
    }, () => {
        popUpNextStepButton.css(CSS.BUTTON);
    });
    popUpNextStepButton.hide();
    popUpNextStepButton.on('click', event => {
        //stop timers and animations
        isNotNull(globalCache.currentJQScrollingParent) && globalCache.currentJQScrollingParent.stop();
        isNotNull(timer) && clearTimeout(timer);
        removeLastHighlight();
        globalCache.currentJQScrollingParent = null;
        timer = null;
        globalCache.highlightedElementInterval = null;
        //auto go to next step
        globalCache.isAutomatingNextStep = true;
        showTutorialStepAuto();
    })

    mainPopUpContainer.hide();
    mainPopUpContainer.children().hide();
    $('.common-item').show();

    wrongPageRedirectButton = $('#wrong-page-redirect-button');
    wrongPageRedirectButton.css(CSS.WRONG_PAGE_REDIRECT_BUTTON);

    //Highlight instruction window
    $('body').append(
        `
        <div id=\"highlight-instruction-window\">
            <h3 id=\"pop-up-step-name\" class=\"following-tutorial-item\"></h3>
            <p id=\"pop-up-step-description\" class=\"following-tutorial-item\"></p>
        </div>
        `
    );

    highlightInstructionWindow = $('#highlight-instruction-window');
    highlightInstructionWindow.css(CSS.HIGHLIGHT_INSTRUCTION_WINDOW);
    highlightInstructionWindow.hide();

    popUpStepName = $("#pop-up-step-name");
    popUpStepName.css({ 'overflow-wrap': 'break-word', });
    popUpStepDescription = $("#pop-up-step-description");
    popUpStepDescription.css({ 'overflow-wrap': 'break-word', });

})
