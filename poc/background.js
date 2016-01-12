(function () {
    "use strict";

    var configPerTabId = {};

    // Message handling
    chrome.extension.onConnect.addListener(function (port) {
        port.onMessage.addListener(function (msg) {
            if ("query-status" === msg.type) {
                var config = configPerTabId[msg.tabId];
                port.postMessage({
                    type: "status",
                    enabled: undefined !== config && config.enabled
                });
            }
        });
    });

    // Hook before Request to log requests
    chrome.webRequest.onBeforeRequest.addListener(function (details) {
        console.log(details);
        if (0 === details.url.indexOf("https://www.google.ca/images/branding/googlelogo/")) {
            return {
                //cancel: true,
                redirectUrl: "http://users.skynet.be/lemondeduweb/gogole/gogol.JPG"
            };
        }
    }, {
        urls: ["<all_urls>"]
    }, ["blocking"]);

}());
