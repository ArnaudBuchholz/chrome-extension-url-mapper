(function () {
    "use strict";

    // Defines namespace
    global.um = {};

    // Mocks chrome API & navigator environment
    global.chrome = require("./chrome.js");
    global.window = require("./window.js");

    // Loads components
    require("./../../src/constants.js");
    require("./../../src/mapoptions.js");
    require("./../../src/mapping.js");
    require("./../../src/configuration.js");
    require("./../../src/backconfig.js");
    require("./../../src/backconfigmap.js");
    require("./../../src/background.js");

    require("./../../src/popup/PopupController.js");

    // Mocks PopupView
    um.PopupView = require("./PopupView.js");

}());
