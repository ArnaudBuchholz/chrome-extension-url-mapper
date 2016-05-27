describe("Ajax", function () {
    "use strict";

    var HELLO_WORLD = "Hello, World!";

    function checkAjaxHandling (expectedMessage) {

        if (!expectedMessage) {
            expectedMessage = HELLO_WORLD;
        }

        it("allows asynchronous loading", function (done) {
            var xhr = new window.XMLHttpRequest();
            xhr.open("GET", "/test/data/hello.json");
            xhr.onreadystatechange = function () {
                if (4 === xhr.readyState) {
                    if (2 === Math.floor(xhr.status / 100)) {
                        var response = JSON.parse(xhr.responseText);
                        assert(expectedMessage === response.message);
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
                assert(expectedMessage === response.message);
                done();
            } else {
                done(xhr.responseText);
            }
        });

    }

    describe("Checking unaltered handling", function () {
        checkAjaxHandling();
    });

    describe("Installing hook", function () {

        var unhook;

        before(function () {
            um.hook();
            unhook = window._removeUrlMapperHook;
            delete window._removeUrlMapperHook;
        });

        after(function () {
            unhook();
        });

        describe("No override", function () {

            checkAjaxHandling();

        });

        function genOverride (message) {

            var data = {};

            function _receiveExtensionOpenRequest (event) {
                var parameters = event.detail;
                if (parameters[0] === "GET" && parameters[1] === "/test/data/hello.json") {
                    window.dispatchEvent(new CustomEvent("chrome-extension-url-mapper>>xhr::open", {
                        detail: {
                            data: data
                        }
                    }));
                }
            }

            function _receiveExtensionSendRequest (event) {
                var details = event.detail;
                assert(details.data === data); // Whatever the data that was given, it should be sent back
                window.dispatchEvent(new CustomEvent("chrome-extension-url-mapper>>xhr::send", {
                    detail: {
                        responseText: JSON.stringify({
                            message: message
                        }),
                        responseType: "text/plain",
                        status: 200,
                        statusText: "OK",
                        readyState: 4
                    }
                }));

            }

            before(function () {
                window.addEventListener("chrome-extension-url-mapper<<xhr::open", _receiveExtensionOpenRequest);
                window.addEventListener("chrome-extension-url-mapper<<xhr::send", _receiveExtensionSendRequest);
            });

            after(function () {
                window.removeEventListener("chrome-extension-url-mapper<<xhr::open", _receiveExtensionOpenRequest);
                window.removeEventListener("chrome-extension-url-mapper<<xhr::send", _receiveExtensionSendRequest);
            });

        }

        describe("Override for the same result", function () {

            genOverride(HELLO_WORLD);
            checkAjaxHandling();

        });

        describe("Override for a different result", function () {

            var message = "Goodbye, World!";
            genOverride(message);
            checkAjaxHandling(message);

        });

    });

});
