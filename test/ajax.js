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

        describe("Test 1", function () {

            function _receiveExtensionOpenRequest (event) {
                var parameters = event.detail;
                if (parameters[0] === "GET" && parameters[1] === "/test/data/hello.json") {
                    window.dispatchEvent(new CustomEvent("chrome-extension-url-mapper>>xhr::open", {
                        detail: {
                            id: 0
                        }
                    }));
                }
            }

            function _receiveExtensionSendRequest (event) {
                var details = event.detail;
                window.dispatchEvent(new CustomEvent("chrome-extension-url-mapper>>xhr::send", {
                    detail: {
                        id: details.id,
                        xhr: {
                            responseText: "{\"message\": \"Hello, World!\"}",
                            responseType: "text/plain",
                            status: 200,
                            statusText: "OK",
                            readyState: 4
                        }
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

            checkAjaxHandling();

        });

    });

});
