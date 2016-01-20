(function () {
    "use strict";
    /*eslint-env node*/

    function _allocateEventHandler () {
        var listeners = [],
            result;
        result = function () {
            var args = arguments;
            listeners.forEach(function (listener) {
                listener.apply(null, args);
            });
        };
        result.addListener = function (listener) {
            listeners.push(listener);
        };
        return result;
    }

    module.exports = {
        browserAction: {
            setBadgeText: function (details) {
                // expect details.tabId & details.text
            }
        },
        runtime: {
            sendMessage: function (any, responseCallback) {
                _runtime.onMessage(any, null, responseCallback);
            },
            onMessage: _allocateEventHandler()
        },
        tabs: {
            query: function (queryInfo, callback) {

            },
            onRemoved: _allocateEventHandler()
        },
        webRequest: {
            onBeforeRequest: _allocateEventHandler()
        }
    };

}());