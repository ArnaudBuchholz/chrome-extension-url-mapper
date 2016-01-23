/*eslint-env mocha*/
/*global assert*/

/*eslint-disable max-nested-callbacks*/

describe("Testing the environment", function () {
    "use strict";

    var URL = "https://github.com/ArnaudBuchholz/chrome-extension-url-mapper";

    describe("Create one tab and simulate the PopupView", function () {

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

        it("receives and displays a tabId", function () {
            assert(tab.id === view.tabId);
        });

        it("gets an initial state", function () {
            assert(um.MSG_NO_CONFIGURATION === view.name);
            assert(false === view.state);
        });

        describe("Configure the service", function () {
            before(function (done) {
                view.whenNoMoreBusy = function () {
                    view.whenNoMoreBusy = done;
                    controller.switchState();
                };
                controller.setConfiguration(JSON.stringify({
                    name: "test",
                    mappings: [{
                        url: URL,
                        block: true
                    }]
                }));
            });

            it("shows the configuration name", function () {
                assert("test" === view.name);
            });

            it("is enabled", function () {
                assert(true === view.state);
            });

            it("processes the web requests", function () {
                var answer = chrome.webRequest.onBeforeRequest({
                    tabId: tab.id,
                    url: URL
                });
                assert(true === answer.cancel);
            });

            describe("Close the tab", function () {

                before(function (done) {
                    chrome.tabs.remove(tab.id, done);
                });

                it("cleans the mapping", function () {
                    // Border-line: we are not supposed to call this method once the tab is closed
                    var answer = chrome.webRequest.onBeforeRequest({
                        tabId: tab.id,
                        url: URL
                    });
                    assert(undefined === answer);
                });

            });

        });

    });

});
