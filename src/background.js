(function () {
    "use strict";

    // Compute status of (optional) configuration
    function _getStatus (configuration) {
        if (!configuration) {
            return {
                name: "",
                enabled: false
            };
        }
        return {
            name: configuration.getName(),
            enabled: configuration.getIsEnabled()
        };
    }

    // Update extension icon badge text
    function _setBrowserActionText (configuration) {
        var badgeText;
        if (configuration.getIsEnabled()) {
            badgeText = "ON";
        } else {
            badgeText = "";
        }
        chrome.browserAction.setBadgeText({tabId: configuration.getTabId(), text: badgeText});
    }

    var configPerTabId = new um.BackgroundConfigurationMap(),
        messageHandlers = {

            // Triggered by the content script
            MSG_INIT_XHR_CONTENT_SCRIPT: function (configuration/*, msg, sender*/) {
                var status = _getStatus(configuration);
                if (configuration) {
                    status.configuration = configuration.toJSON();
                }
                return status;
            },

            MSG_QUERY_STATUS: _getStatus,

            MSG_SET_CONFIGURATION: function (configuration, msg, sender) {
                configuration = configPerTabId.set(sender.tab.id, msg.configuration);
                _setBrowserActionText(configuration);
                return _getStatus(configuration);
            },

            MSG_ENABLE_CONFIGURATION: function (configuration/*, msg, sender*/) {
                if (configuration) {
                    configuration.enable();
                    _setBrowserActionText(configuration);
                }
                return _getStatus(configuration);
            },

            MSG_DISABLE_CONFIGURATION: function (configuration/*, msg, sender*/) {
                configuration.disable();
                _setBrowserActionText(configuration);
                return _getStatus(configuration);
            }

        };

    // Translate constant names to their values
    Object.keys(messageHandlers).forEach(function (constantName) {
        messageHandlers[um[constantName]] = messageHandlers[constantName];
        delete messageHandlers[constantName];
    });

    // Message handling
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        var configuration = configPerTabId.get(sender.tab.id),
            handler = messageHandlers[request.type],
            answer = handler(configuration, request, sender);
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
            _setBrowserActionText(configuration);
        }
    });

    // WebRequest events
    function _log (event, request) {
        var args = [].slice.call(arguments, 0);
        args.unshift("requestId:", request.requestId);
        args.unshift("tabId:", request.tabId);
        console.log.apply(console, args);
    }

    chrome.webRequest.onBeforeRequest.addListener(function (request) {
        var configuration = configPerTabId.get(request.tabId),
            options,
            result;
        if (configuration) {
            options = new um.MappingOptions();
            result = configuration.map(request, options);
            if (options.debug) {
                _log("onBeforeRequest", request, result, options);
            }
            return result;
        }
    }, {urls: ["<all_urls>"]}, ["blocking"]);

    chrome.webRequest.onHeadersReceived.addListener(function (request) {
        var configuration = configPerTabId.get(request.tabId),
            options;
        if (configuration) {
            options = configuration.getOptions(request) || {};
            if (options.debug) {
                _log("onHeadersReceived", request);
            }
            request.responseHeaders.push({
                name: "Access-Control-Allow-Origin",
                value: "*" // Overridden
            });
            return {
                responseHeaders: request.responseHeaders
            };
        }

    }, {urls: ["<all_urls>"]}, ["responseHeaders", "blocking"]);


    function _getLastStepOfRequest (name) {
        return function (request) {
            var configuration = configPerTabId.get(request.tabId),
                options;
            if (configuration) {
                options = configuration.getOptions(request, true);
                if (options && options.debug) {
                    _log(name, request);
                }
            }
        };
    }

    [
        "onBeforeRedirect",
        "onCompleted",
        "onErrorOccurred"
    ].forEach(function (name) {
        chrome.webRequest[name].addListener(_getLastStepOfRequest(name), {urls: ["<all_urls>"]});
    });

}());
