describe("Configuration", function () {
    "use strict";

    var URL = "https://github.com/ArnaudBuchholz/chrome-extension-url-mapper";

    var tab,
        view,
        controller;

    before(function (done) {
        chrome.tabs.create({}, function (newTab) {
            tab = newTab;
            view = new um.PopupView();
            view.whenNoMoreBusy = done;
            controller = new um.PopupController(view);
        });
    });

    describe("request lifecycle", function () {

        before(function (done) {
            view.whenNoMoreBusy = function () {
                view.whenNoMoreBusy = done;
                controller.switchState();
            };
            controller.setConfiguration(JSON.stringify({
                "name": "Request lifecycle",
                "mappings": [{
                    url: "http",
                    debug: true
                }]
            }));
        });

        it("shows the configuration name", function () {
            assert("Request lifecycle" === view.name);
        });

        it("is enabled", function () {
            assert(true === view.state);
        });

        it("processes the web requests", function () {
            var answer = chrome.webRequest.onBeforeRequest({
                tabId: tab.id,
                requestId: 1,
                url: URL
            });
            assert(undefined === answer);
        });

    });

    after(function (done) {
        chrome.tabs.remove(tab.id, done);
    });

});
