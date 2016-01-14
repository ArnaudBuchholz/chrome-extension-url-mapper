(function () {
    "use strict";

    // Message handling
    var backgroundPort = chrome.extension.connect({name: "chrome-extension-url-mapper"});
    backgroundPort.onMessage.addListener(function (msg) {
        if ("status" === msg.type) {
            var newClassName = "switch ";
            if (msg.enabled) {
                newClassName += "on";
                chrome.browserAction.setBadgeText({text: "ON"});
            } else {
                newClassName += "off";
                chrome.browserAction.setBadgeText({text: ""});
            }
            document.querySelector(".switch").className = newClassName;
        }
    });

    function _onInit () {

        var tabId;

        // Grab current tab
        chrome.tabs.getSelected(null, function (tab) {
            tabId = tab.id;
            document.querySelector(".tabId").innerHTML = tabId;
            // Query status
            backgroundPort.postMessage({
                type: "query-status",
                tabId: tabId
            });
        });

        document.getElementById("source").onchange = function () {
            document.querySelector("span.name").innerHTML = this.value;
            chrome.browserAction.setTitle({title: this.value});
            chrome.browserAction.setBadgeText({text: "ON"});
            chrome.browserAction.setBadgeBackgroundColor({color: "#FF0000"});
            window.close();
        };

        document.querySelector("span.name").addEventListener("click", function () {
            alert("YO!");
        });

        document.querySelector(".switch").addEventListener("click", function () {
            alert("YO!");
        });

    }

    /*
http://stackoverflow.com/questions/13546778/how-to-communicate-between-popup-js-and-background-js-in-chrome-extension
     */
    document.addEventListener("DOMContentLoaded", _onInit);

}());
