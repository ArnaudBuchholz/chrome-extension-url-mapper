(function () {
    "use strict";

    /**
     * Popup View implementation
     *
     * @implements IPopupView
     * @constructor
     */
    function PopupView() {}

    PopupView.prototype = {

        // @inheritdoc IPopupView#setTabId
        setTabId: function (tabId) {
            document.querySelector(".tabId").innerHTML = tabId;
        },

        // @inheritdoc IPopupView#setSwitchState
        setSwitchState: function (state) {
            var newClassName = "switch ";
            if (status) {
                newClassName += "on";
            } else {
                newClassName += "off";
            }
            document.querySelector(".switch").className = newClassName;
        }

    };

    document.addEventListener("DOMContentLoaded", function () {
        var controller = new um.PopupController(new PopupView());

        document.getElementById("source").onchange = function () {
            // Handle the loading of the configuration file
            controller.setConfiguration();
        };

        document.querySelector("span.name").addEventListener("click", function () {
            // Open file dialog
        });

        document.querySelector(".switch").addEventListener("click", function () {
            controller.switchState();
        });
    });

}());
