(function () {
    "use strict";
    /*eslint-env node*/

    require("./node.js");

    global.assert = require("assert");

    var Mocha = require("mocha"),
        mocha = new Mocha({ui: "bdd"});

    mocha.addFile("test/environment.js");
    mocha.addFile("test/multitabs.js");
    mocha.addFile("test/mapping.js");

    // Now, you can run the tests.
    mocha.run(function (failures) {
        process.on("exit", function () {
            process.exit(failures);
        });
    });

}());
