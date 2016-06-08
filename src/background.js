(function () {
    "use strict";

    //region Internal messages handling

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

    // Mapping of message handlers
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

            MSG_SET_CONFIGURATION: function (configuration, msg/*, sender*/) {
                configuration = configPerTabId.set(msg.tabId, msg.configuration);
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
        var configuration = configPerTabId.get(request.tabId || sender.tab.id),
            handler = messageHandlers[request.type],
            answer = handler(configuration, request, sender);
        if (answer) {
            sendResponse(answer);
        }
    });

    //endregion

    //region Tab events

    chrome.tabs.onRemoved.addListener(function (tabId) {
        configPerTabId.clear(tabId);
    });

    chrome.tabs.onUpdated.addListener(function (tabId) {
        var configuration = configPerTabId.get(tabId);
        if (configuration) {
            _setBrowserActionText(configuration);
        }
    });

    //endregion

    //region WebRequest events

    /**
     * Wrap the listener function to receive the proper configuration (and avoid calling if no configuration is found)
     *
     * @param {Function} listener function handler(request, configuration)
     * @returns {Function}
     */
    function _wrapRequestListener (listener) {
        return function (request) {
            var configuration = configPerTabId.get(request.tabId);
            if (configuration) {
                return listener(request, configuration);
            }
        };
    }

    // Generic logging
    function _log (event, request) {
        var args = [].slice.call(arguments, 0);
        args.unshift("requestId:", request.requestId);
        args.unshift("tabId:", request.tabId);
        console.log.apply(console, args);
    }

    // Get options and log if debug
    function _getOptionsAndLog (request, configuration, name) {
        var options = configuration.getOptions(request) || {};
        if (options.debug) {
            _log(name, request);
        }
        return options;
    }

    chrome.webRequest.onBeforeRequest.addListener(_wrapRequestListener(function (request, configuration) {
        var options = new um.MappingOptions(),
            result = configuration.map(request, options);
        if (options.debug) {
            _log("onBeforeRequest", request, result, options);
        }
        return result;
    }), {urls: ["<all_urls>"]}, ["blocking"]);

    function _overrideHeaders (headers, overrides) {
        var toAdd = Object.keys(overrides),
            result;
        result = headers.map(function (header) {
            var name = header.name;
            if (overrides.hasOwnProperty(name)) {
                toAdd.splice(toAdd.indexOf(name), 1); // remove because processed
                return {
                    name: name,
                    value: overrides[name]
                };
            }
            return header;
        });
        // adds remaining
        toAdd.forEach(function (name) {
            result.push({
                name: name,
                value: overrides[name]
            });
        });
        return result;
    }

    chrome.webRequest.onHeadersReceived.addListener(_wrapRequestListener(function (request, configuration) {
        var options = _getOptionsAndLog(request, configuration, "onHeadersReceived");
        return {
            responseHeaders: _overrideHeaders(request.responseHeaders, {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS", // POST not supported
                "Access-Control-Allow-Headers": options.acHeaders || ""
            })
        };

    }), {urls: ["<all_urls>"]}, ["responseHeaders", "blocking"]);

    chrome.webRequest.onErrorOccurred.addListener(_wrapRequestListener(function (request, configuration) {
        var options = _getOptionsAndLog(request, configuration, "onErrorOccurred");
        if ("net::ERR_ABORTED" === request.error) {
            // This might come from unsecure content
            _showWarning(configuration.getTabId());
        }

    }), {urls: ["<all_urls>"]});

    var WARNING_TEXT = "WARNING WAR",
        WARNING_LENGTH = 8,
        WARNING_DELAY = 250,
        WARNING_DURATION = 5000;

    function _warningLoop () {
        chrome.browserAction.setBadgeText({tabId: this.tabId, text: WARNING_TEXT.substr(this.step, 4)});
        chrome.browserAction.setTitle({tabId: this.tabId, title: "Allow unsecure content"});
        this.step = (this.step + 1) % WARNING_LENGTH;
        if (new Date() - this.timeStamp > WARNING_DURATION) {
            clearInterval(this.interval);
            chrome.browserAction.setBadgeText({tabId: this.tabId, text: WARNING_TEXT.substr(0, 4)});
            this.interval = 0;
        }
    }

    function _showWarning (tabId) {
        var data = _showWarning[tabId],
            text = "WARNING WAR",
            textLen = 8;
        if (!data) {
            data = {
                tabId: tabId,
                step: 0,
                interval: 0
            };
            _showWarning[tabId] = data;
        }
        data.timeStamp = new Date();
        if (!data.interval) {
            data.interval = setInterval(_warningLoop.bind(data), WARNING_DELAY);
        }
    }

    // Logging listeners
    [
        "onBeforeRedirect",
        "onCompleted"
    ].forEach(function (name) {
        chrome.webRequest[name].addListener(_wrapRequestListener(function (request, configuration) {
            _getOptionsAndLog(request, configuration, name);
        }), {urls: ["<all_urls>"]});
    });

    //endregion

}());
