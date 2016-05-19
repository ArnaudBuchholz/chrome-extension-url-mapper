describe("Ajax", function () {
    "use strict";

    function checkAjaxHandling () {

        it("allows asynchronous loading", function (done) {
            var xhr = new window.XMLHttpRequest();
            xhr.open("GET", "/test/data/hello.json");
            xhr.onreadystatechange = function () {
                if (4 === xhr.readyState) {
                    if (2 === Math.floor(xhr.status / 100)) {
                        var response = JSON.parse(xhr.responseText);
                        assert("Hello, World!" === response.message);
                        done();
                    } else {
                        done(xhr.responseText);
                    }
                }
            };
            xhr.send();
        });

        it("allows synchronous loading", function (done) {
            var xhr = new window.XMLHttpRequest();
            xhr.open("GET", "/test/data/hello.json", true);
            xhr.send();
            if (2 === Math.floor(xhr.status / 100)) {
                var response = JSON.parse(xhr.responseText);
                assert("Hello, World!" === response.message);
                done();
            } else {
                done(xhr.responseText);
            }
        });

    }

    describe("Checking unaltered handling", function () {
        checkAjaxHandling();
    });

    describe("Installing hook (no interference)", function () {

        var unhook;

        before(function () {
            um.hook();
            unhook = window._removeUrlMapperHook;
            delete window._removeUrlMapperHook;
        });

        after(function () {
            unhook();
        });

        checkAjaxHandling();

    });

});
