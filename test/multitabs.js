/*eslint-env mocha*/
/*global assert*/

/*eslint-disable max-nested-callbacks*/

describe("Testing with multiple tabs", function () {
    "use strict";

    var URL = "https://github.com/ArnaudBuchholz/chrome-extension-url-mapper";

    describe("Create several tabs and simulate the PopupView", function () {

        var COUNT = 3,
            SELECTED_TAB = 1,
            tabs = [];

        before(function (done) {
            var idx = 0,
                count = 0;
            function doneOnCount () {
                if (COUNT === ++count) {
                    done();
                }
            }
            function onTabCreated (newTab) {
                tabs.push(newTab);
                newTab.popupView = new um.PopupView();
                newTab.popupView.whenNoMoreBusy = doneOnCount;
                newTab.popupController = new um.PopupController(newTab.popupView);
            }
            for (idx = 0; idx < COUNT; ++idx) {
                chrome.tabs.create({}, onTabCreated);
            }
        });

        it("receives and displays a tabId", function () {
            tabs.forEach(function (tab) {
                assert(tab.id === tab.popupView.tabId);
            });
        });

        it("gots an initial state", function () {
            tabs.forEach(function (tab) {
                assert(um.MSG_NO_CONFIGURATION === tab.popupView.name);
                assert(false === tab.popupView.state);
            });
        });

        describe("Configure the service on a selected tab", function () {
            before(function (done) {
                var tab = tabs[SELECTED_TAB];
                tab.popupView.whenNoMoreBusy = function () {
                    tab.popupView.whenNoMoreBusy = done;
                    tab.popupController.switchState();
                };
                tab.popupController.setConfiguration(JSON.stringify({
                    name: "test",
                    mappings: [{
                        url: URL,
                        block: true
                    }]
                }));
            });

            it("shows the configuration name", function () {
                tabs.forEach(function (tab, index) {
                    if (SELECTED_TAB === index) {
                        assert("test" === tab.popupView.name);
                    } else {
                        assert(um.MSG_NO_CONFIGURATION === tab.popupView.name);
                    }
                });
            });

            it("is enabled", function () {
                tabs.forEach(function (tab, index) {
                    if (SELECTED_TAB === index) {
                        assert(true === tab.popupView.state);
                    } else {
                        assert(false === tab.popupView.state);
                    }
                });
            });

            it("processes the web requests", function () {
                tabs.forEach(function (tab, index) {
                    var answer = chrome.webRequest.onBeforeRequest({
                        tabId: tab.id,
                        url: URL
                    });
                    if (SELECTED_TAB === index) {
                        assert(true === answer.cancel);
                    } else {
                        assert(undefined === answer);
                    }
                });
            });

            describe("Close the tab", function () {

                before(function (done) {
                    var count = 0;
                    tabs.forEach(function (tab) {
                        chrome.tabs.remove(tab.id, function () {
                            if (tabs.length === ++count) {
                                done();
                            }
                        });

                    });
                });

                it("cleaned the mapping", function () {
                    // Border-line: we are not supposed to call this method once the tab is closed
                    tabs.forEach(function (tab) {
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

});
