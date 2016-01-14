(function () {
    "use strict";

    var configPerTabId = new um.ConfigurationMap(),
        messageHandlers = {};

    messageHandlers[um.MSG_QUERY_STATUS] = function (configuration, msg) {
        return {
            enabled: undefined !== configuration && configuration.getIsEnabled()
        };
    };

    // Message handling
    chrome.extension.onConnect.addListener(function (port) {
        port.onMessage.addListener(function (msg) {
            var configuration = configPerTabId.get(msg.tabId),
                handler = messageHandlers[msg.type],
                answer = handler.call(null, configuration, msg);
            if (answer) {
                answer.type = msg.type;
                port.postMessage(answer);
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
