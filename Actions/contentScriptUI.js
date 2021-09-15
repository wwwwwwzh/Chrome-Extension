//tutorial menu
$('body').append("<div id=\"main-popup-container\"></div>");
const mainPopUpContainer = $('#main-popup-container');
mainPopUpContainer.css(CSS.MAIN_OPTIONS_POPUP);
mainPopUpContainer.hide();

//automation speed slider
mainPopUpContainer.append("<input type=\"range\" min=\"1\" max=\"100\" value=\"50\" id=\"automation-speed-slider\">");
const automationSpeedSlider = $('#automation-speed-slider');
//automationSpeedSlider.css(CSS.AUTOMATION_SPEED_SLIDER);
//automationSpeedSlider.hide();

//stop tutorial options
$('body').append("<div id=\"main-stop-options-container\"></div>");
const mainStopOptionsContainer = $('#main-stop-options-container');
mainStopOptionsContainer.css(CSS.MAIN_STOP_OPTIONS_CONTAINER);
mainStopOptionsContainer.hide();

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

mainMiddlePopupContainer.append("<button id=\"pop-up-automate-button\">Automate</button>")
mainMiddlePopupContainer.append("<button id=\"pop-up-manual-button\">Walk Me Through</button>")

const popUpAutomateButton = $("#pop-up-automate-button");
const popUpManualButton = $("#pop-up-manual-button");
