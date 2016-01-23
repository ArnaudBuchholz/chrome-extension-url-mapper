"use strict"; //eslint-disable-line strict
/*eslint-env node*/

// Test automation inside NodeJS
module.exports = {
    source: {
        options: {
            reporter: "spec",
            quiet: false,
            require: "test/host/node.js"
        },
        src: "test/*.js"
    }
};
