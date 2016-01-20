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

    messageHandlers[um.MSG_QUERY_STATUS] = function (configuration/*, msg*/) {
        if (undefined !== configuration) {
            return _getStatus(configuration);
        }
        return {
            name: "",
            enabled: false
        };
    };

    messageHandlers[um.MSG_SET_CONFIGURATION] = function (configuration, msg) {
        configuration = configPerTabId.set(msg.tabId, msg.configuration);
        return _getStatus(configuration);
    };

    messageHandlers[um.MSG_ENABLE_CONFIGURATION] = function (configuration/*, msg*/) {
        configuration.enable();
        return _getStatus(configuration);
    };

    messageHandlers[um.MSG_DISABLE_CONFIGURATION] = function (configuration/*, msg*/) {
        configuration.disable();
        return _getStatus(configuration);
    };

    // Message handling
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        var configuration = configPerTabId.get(request.tabId),
            handler = messageHandlers[request.type],
            answer = handler(configuration, request);
        if (answer) {
            sendResponse(answer);
        }
    });

    // Tab events
    chrome.tabs.onRemoved.addListener(function (tabId) {
        configPerTabId.clear(tabId);
    });

    // Hook before Request to log requests
    chrome.webRequest.onBeforeRequest.addListener(function (request) {
        var configuration = configPerTabId.get(request.tabId);
        if (configuration) {
            return configuration.map(request);
        }
    }, {
        urls: ["<all_urls>"]
    }, ["blocking"]);

}());
