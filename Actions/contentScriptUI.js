//tutorial menu
$('body').append("<div id=\"main-popup-container\"></div>");
const mainPopUpContainer = $('#main-popup-container');
mainPopUpContainer.css(CSS.MAIN_OPTIONS_POPUP);
mainPopUpContainer.hide();

mainPopUpContainer.append("<div id=\"main-draggable-area\"></div>");
const mainDraggableArea = $('#main-draggable-area');
mainDraggableArea.css(CSS.POPUP_DRAGGABLE);



//automation speed slider
mainPopUpContainer.append("<input type=\"range\" min=\"1\" max=\"100\" value=\"50\" id=\"automation-speed-slider\">");
const automationSpeedSlider = $('#automation-speed-slider');


//stop tutorial options
$('body').append("<div id=\"main-stop-options-container\"></div>");
const mainStopOptionsContainer = $('#main-stop-options-container');
mainStopOptionsContainer.css(CSS.MAIN_STOP_OPTIONS_CONTAINER);
mainStopOptionsContainer.hide();

mainStopOptionsContainer.append("<div id=\"options-draggable-area\"></div>");
const optionsDraggableArea = $('#options-draggable-area');
optionsDraggableArea.css(CSS.POPUP_DRAGGABLE);

mainStopOptionsContainer.append("<button id=\"stop-options-stop-button\">Stop</button>");
const stopOptionsStopButton = $('#stop-options-stop-button');
stopOptionsStopButton.on('click', () => {
    onStopTutorialButtonClicked();
});


//middle popup
$('body').append("<div id=\"main-middle-popup-container\"></div>");
const mainMiddlePopupContainer = $('#main-middle-popup-container');
mainMiddlePopupContainer.css(CSS.MAIN_MIDDLE_POPUP);
mainMiddlePopupContainer.hide();

mainMiddlePopupContainer.append("<div id=\"middle-draggable-area\"></div>");
const middleDraggableArea = $('#middle-draggable-area');
middleDraggableArea.css(CSS.POPUP_DRAGGABLE);

//automate and walk through buttons
mainMiddlePopupContainer.append("<button id=\"pop-up-automate-button\">Automate</button>")
mainMiddlePopupContainer.append("<button id=\"pop-up-manual-button\">Walk Me Through</button>")

const popUpAutomateButton = $("#pop-up-automate-button");
const popUpManualButton = $("#pop-up-manual-button");

//guides during tutorial
mainMiddlePopupContainer.append("<h3 id=\"pop-up-step-name\"></h3>")
mainMiddlePopupContainer.append("<p id=\"pop-up-step-description\"></p>")

const popUpStepName = $("#pop-up-step-name");
const popUpStepDescription = $("#pop-up-step-description");
