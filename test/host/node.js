(function () {
    "use strict";
    /*eslint-env node*/

    // Defines namespace
    global.um = {};

    // Mocks chrome API
    global.chrome = require("./chrome.js");

    // Loads components
    require("./../../src/constants.js");
    require("./../../src/mapping.js");
    require("./../../src/configuration.js");
    require("./../../src/configmap.js");
    require("./../../src/background.js");

    require("./../../src/popup/PopupController.js");

    // Mocks PopupView
    um.PopupView = require("./PopupView.js");

    // Load tests
    global.assert = require("assert");

    if ("undefined" === typeof describe) {
        require("./mocha.js");
    }

}());
