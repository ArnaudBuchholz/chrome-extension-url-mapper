"use strict"; //eslint-disable-line strict
/*eslint-env node*/

// Test automation inside NodeJS
module.exports = {
    source: {
        options: {
            reporter: "spec",
            quiet: false,
            require: [
                function () { //eslint-disable-line strict
                    global.assert = require("assert");
                },
                "test/host/node.js"
            ]
        },
        src: "test/*.js"
    }
};
