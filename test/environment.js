/*eslint-env mocha*/
/*global assert*/

/*eslint-disable max-nested-callbacks*/

describe("environment", function () {
    "use strict";

    var view,
        controller;

    beforeEach(function () {
        view = new um.PopupView();
        controller = new um.PopupController(view);
    });

    it("receives and displays a tabId", function () {
        assert(controller.tabId !== "");
        assert(view.tabId === controller.tabId);
    });

});

