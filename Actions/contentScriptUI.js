let mainPopUpContainer;
let mainDraggableArea;
let automationSpeedSlider;
let stopOptionsStopButton;
let popUpAutomateButton;
let popUpManualButton;
let popUpCancelButton;
let popUpStepName;
let popUpStepDescription;
let popUpNextStepButton;
let wrongPageRedirectButton;
let mainCloseButton;
let popUpHeader;

let highlightInstructionWindow;

$(() => {
    //tutorial menu
    $('body').append(
        `
        <div id=\"w-main-popup-container\" class=\"w-main-popup\">
            <div id=\"w-main-draggable-area\"  class=\"w-common-item w-popup-draggable\"></div>

            <div id=\"w-popup-header\" class=\"w-common-item\">
                <div class=\"w-common-item w-close-button\" id=\"w-main-close-button\"></div>
            </div>

            <button id=\"w-popup-automate-button\" class=\"w-follow-tutorial-options-item w-button-normal\">Automate</button>
            <button id=\"w-popup-manual-button\" class=\"w-follow-tutorial-options-item w-button-normal\">Walk Me Through</button>
            <button id=\"w-popup-cancel-button\" class=\"w-follow-tutorial-options-item w-button-normal\">Cancel</button>

            <button id=\"w-popup-next-step-button\" class=\"w-following-tutorial-item w-button-normal\">Next</button>
            <button id=\"w-stop-options-stop-button\" class=\"w-following-tutorial-item w-button-normal\">Stop</button>
            
            <input type=\"range\" min=\"1\" max=\"100\" value=\"50\" id=\"w-automation-speed-slider\" class=\"w-common-item\">

            <a href="/" id=\"w-wrong-page-redirect-button\" class=\"w-wrong-page-item w-wrong-page-redirect-button\">You have an ongoing tutorial on [website address]</a>
        </div>
        <div id=\"w-highlight-instruction-window\" class=\"w-highlight-instruction-window\">
            <h3 id=\"w-popup-step-name\" class=\"w-following-tutorial-item\"></h3>
            <p id=\"w-popup-step-description\" class=\"w-following-tutorial-item\"></p>
        </div>
        `
    );
    mainPopUpContainer = $('#w-main-popup-container');

    mainDraggableArea = $('#w-main-draggable-area');
    makeElementDraggable(mainDraggableArea[0], mainPopUpContainer[0]);

    automationSpeedSlider = $('#w-automation-speed-slider');
    automationSpeedSlider.on('change', () => {
        onAutomationSpeedSliderChanged();
    })

    popUpHeader = $('#w-popup-header');
    mainCloseButton = $('#w-main-close-button');

    mainCloseButton.on("click", () => {
        if (globalCache.isMainPopUpCollapsed) {
            mainPopUpContainer.removeClass('w-popup-collapsed');
            mainPopUpContainer.addClass('w-main-popup');
            mainCloseButton.removeClass('w-close-button-collapsed');
            mainCloseButton.addClass('w-close-button');
            mainPopUpContainer.find('.w-should-reopen').show();
            mainPopUpContainer.find('.w-should-reopen').removeClass('w-should-reopen');

            globalCache.isMainPopUpCollapsed = false;
        } else {
            mainPopUpContainer.find(':visible').each((i, element) => {
                $(element).addClass('w-should-reopen');
            })
            mainPopUpContainer.removeClass('w-main-popup');
            mainPopUpContainer.addClass('w-popup-collapsed');
            mainPopUpContainer.children().hide();
            mainCloseButton.removeClass('w-close-button');
            mainCloseButton.addClass('w-close-button-collapsed');
            popUpHeader.show();
            mainDraggableArea.show();
            globalCache.isMainPopUpCollapsed = true;
        }
    })


    //choose options before start
    popUpAutomateButton = $("#w-popup-automate-button");
    popUpManualButton = $("#w-popup-manual-button");
    popUpCancelButton = $('#w-popup-cancel-button');
    popUpCancelButton.on('click', () => {
        $('.w-follow-tutorial-options-item').hide();
        fetchSimpleTutorials();
    })

    //guides during tutorial
    popUpNextStepButton = $("#w-popup-next-step-button");
    popUpNextStepButton.hide();
    popUpNextStepButton.on('click', event => {
        //auto go to next step
        globalCache.isAutomatingNextStep = true;
        showTutorialStepAuto();
    })

    stopOptionsStopButton = $('#w-stop-options-stop-button');
    stopOptionsStopButton.on('click', () => {
        onStopTutorialButtonClicked();
    });

    wrongPageRedirectButton = $('#w-wrong-page-redirect-button');

    mainPopUpContainer.hide();
    mainPopUpContainer.children().hide();
    $('.w-common-item').show();

    //Highlight instruction window
    highlightInstructionWindow = $('#w-highlight-instruction-window');
    highlightInstructionWindow.hide();

    popUpStepName = $("#w-popup-step-name");
    popUpStepName.css({ 'overflow-wrap': 'break-word', });
    popUpStepDescription = $("#w-popup-step-description");
    popUpStepDescription.css({ 'overflow-wrap': 'break-word', });

})
