(function () {
    "use strict";

    var configPerTabId = new um.ConfigurationMap(),
        messageHandlers = {};

    function _getStatus (configuration) {
        return {
            name: configuration.getName(),
            enabled: configuration.getIsEnabled()
        };
    }

    messageHandlers[um.MSG_QUERY_STATUS] = function (configuration, msg) {
        if (undefined !== configuration) {
            return _getStatus(configuration);
        }
        return {
            name: "",
            enabled: false
        };
    };

    messageHandlers[um.MSG_SET_CONFIGURATION] = function (configuration, msg) {
        configuration = configPerTabId.set(request.tabId, msg.configuration);
        return _getStatus(configuration);
    };

    // Message handling
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        var configuration = configPerTabId.get(request.tabId),
            handler = messageHandlers[request.type],
            answer = handler.call(null, configuration, request);
        if (answer) {
            sendResponse(answer);
        }
    });

    // Tab events
    chrome.tabs.onRemoved.addListener(function (tabId) {
        configPerTabId.clear(tabId);
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
