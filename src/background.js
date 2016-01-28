(function () {
    "use strict";

    var configPerTabId = new um.ConfigurationMap(),
        messageHandlers = {};

    function _getStatus (configuration) {
        if (!configuration) {
            return {
                name: "",
                enabled: false
            };
        }
        var enabled =  configuration.getIsEnabled(),
            badgeText;
        if (enabled) {
            badgeText = "ON";
        } else {
            badgeText = "";
        }
        chrome.browserAction.setBadgeText({tabId: configuration.getTabId(), text: badgeText});
        return {
            name: configuration.getName(),
            enabled: enabled
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
        if (configuration) {
            configuration.enable();
        }
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

    chrome.tabs.onUpdated.addListener(function (tabId) {
        var configuration = configPerTabId.get(tabId);
        if (configuration) {
            _getStatus(configuration);
        }
    });

    // WebRequest events
    var _options = {};

    function _log (event, request) {
        var args = [].slice.call(arguments, 0);
        args.unshift("requestId:", request.requestId);
        args.unshift("tabId:", request.tabId);
        console.log.apply(console, args);
    }

    chrome.webRequest.onBeforeRequest.addListener(function (request) {
        var configuration = configPerTabId.get(request.tabId),
            options = new um.MappingOptions(),
            result;
        if (configuration) {
            result = configuration.map(request, options);
            if (options.areModified()) {
                _options[request.requestId] = options;
                if (options.debug) {
                    _log("onBeforeRequest", request, result);
                }
            }
            return result;
        }
    }, {
        urls: ["<all_urls>"]
    }, ["blocking"]);

    function _getCommonListener (name) {
        return function (request) {
            var options = _options[request.requestId];
            if (options && options.debug) {
                _log(name, request, request.responseHeaders);
            }
        };
    }

    [
        "onBeforeSendHeaders",
        "onSendHeaders",
        "onHeadersReceived",
        "onAuthRequired",
        "onResponseStarted",
        "onBeforeRedirect",
        "onCompleted",
        "onErrorOccurred"
    ].forEach(function (name) {
        var args = [_getCommonListener(name)],
            event;
        // filter
        args.push({
            urls: ["<all_urls>"]
        });
        if ("onHeadersReceived" === name) {
            args.push(["responseHeaders", "blocking"]);
        }
        event = chrome.webRequest[name];
        event.addListener.apply(event, args);
    });

}());
