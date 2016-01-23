/*eslint-env node*/
module.exports = function (grunt) {
    "use strict";

    grunt.registerTask("default", [
        "eslint",
        "mochaTest"
    ]);
};
