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

        // @inheritdoc IPopupView#setBusy
        setBusy: function (busy) {
            if (busy) {
                document.className = "busy";
            } else {
                document.className = "";
            }
        },

        // @inheritdoc IPopupView#setTabId
        setTabId: function (tabId) {
            document.querySelector(".tabId").innerHTML = tabId;
        },

        // @inheritdoc IPopupView#setSwitchState
        setSwitchState: function (state) {
            var newClassName = "switch ";
            if (state) {
                newClassName += "on";
            } else {
                newClassName += "off";
            }
            document.querySelector(".switch").className = newClassName;
        },

        // @inheritdoc IPopupView#setSwitchState
        showError: function (message) {
            alert(message);
        },

        // @inheritdoc IPopupView#setConfigurationName
        setConfigurationName: function (name) {
            var namePlaceholder = document.querySelector("span.name");
            namePlaceholder.innerHTML = ""; // clean
            namePlaceholder.appendChild(document.createTextNode(name)); // Safest way
        }

    };

    document.addEventListener("DOMContentLoaded", function () {
        var controller = new um.PopupController(new PopupView());

        document.getElementById("source").onchange = function (event) {
            var file = event.target.files[0],
                reader;
            if (undefined !== file) {
                reader = new FileReader();
                reader.onload = function (/*event*/) {
                    controller.setConfiguration(reader.result);
                }
                reader.readAsText(file);
            }
        };

        document.querySelector("span.name").addEventListener("click", function () {
            document.getElementById("source").click();
        });

        document.querySelector(".switch").addEventListener("click", function () {
            controller.switchState();
        });
    });

}());
