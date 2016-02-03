describe("Background", function () {
    "use strict";

    var tab,
        view,
        controller;

    before(function (done) {
        chrome.tabs.create({}, function (newTab) {
            tab = newTab;
            view = new um.PopupView();
            view.whenNoMoreBusy = function () {
                view.whenNoMoreBusy = function () {
                    view.whenNoMoreBusy = done;
                    controller.switchState();
                };
                controller.setConfiguration(JSON.stringify({
                    name: "test",
                    mappings: []
                }));
            };
            controller = new um.PopupController(view);
        });
    });

    after(function (done) {
        chrome.tabs.remove(tab.id, done);
    });

    function _toChromeHeaders (dictionary) {
        return Object.keys(dictionary).map(function (key) {
            return {
                name: key,
                value: dictionary[key]
            };
        });
    }

    function _fromChromeHeaders (headers) {
        var result = {};
        headers.forEach(function (header) {
            var name = header.name;
            if (result.hasOwnProperty(name)) {
                throw new Error("Duplicate header '" + name + "'");
            }
            result[name] = header.value;
        });
        return result;
    }

    it("overrides response headers", function () {

        var answer = chrome.webRequest.onHeadersReceived({
            tabId: tab.id,
            responseHeaders: _toChromeHeaders({
                "Access-Control-Allow-Methods": "POST, GET",
                "Access-Control-Allow-Origin": "myserver.com",
                "cache-control": "max-age=315360000, public",
                "content-encoding": "gzip",
                "content-type": "application/json",
                "date": "Wed, 03 Feb 2016 17:47:50 GMT",
                "last-modified": "Tue, 26 Jan 2016 13:49:22 GMT",
                "vary": "Accept-Encoding"
            })
        });
        var overriddenHeaders = _fromChromeHeaders(answer.responseHeaders);
        assert(overriddenHeaders["Access-Control-Allow-Origin"] === "*");

    });

});
