(function () {
    "use strict";
    /*eslint-env node*/

    function _nop() {}

    function _allocateEventHandler (synchronous) {
        var listeners = [],
            result;
        if (synchronous) {
            result = function () {
                var args = arguments,
                    result;
                listeners.forEach(function (listener) {
                    result = listener.apply(null, args); // last one wins...
                });
                return result;
            };
        } else {
            result = function () {
                var args = arguments;
                setTimeout(function () {
                    listeners.forEach(function (listener) {
                        listener.apply(null, args);
                    });
                }, 0);
            };
        }
        result.addListener = function (listener) {
            listeners.push(listener);
        };
        return result;
    }

    var _tabs = {};

    function _Tab (properties) {
        // Allocate a random unique tab identifier
        do {
            this.id = "" + Math.floor(Math.random() * 1000);
        } while (_tabs.hasOwnProperty(this.id));
        _tabs[this.id] = this;
        Object.keys(properties).forEach(function (key) {
            this[key] = properties[key];
        });
    }

    _Tab.prototype = {
        // @property {String} (allocated) tab identifier
        id: "",

        // @property {Boolean} (allocated) tab is active
        active: true,

        // @property {String} (allocated) tab is selected
        selected: true
    };

    var _chrome = {

        // https://developer.chrome.com/extensions/browserAction
        browserAction: {

            // https://developer.chrome.com/extensions/browserAction#method-setBadgeText
            setBadgeText: function (details) {
                // expect details.tabId & details.text
            }
        },

        // https://developer.chrome.com/extensions/runtime
        runtime: {

            // https://developer.chrome.com/extensions/runtime#method-sendMessage
            // Simplified
            sendMessage: function (any, responseCallback) {
                _chrome.runtime.onMessage(any, null, responseCallback);
            },

            // https://developer.chrome.com/extensions/runtime#event-onMessage
            onMessage: _allocateEventHandler(false)
        },

        // https://developer.chrome.com/extensions/tabs
        tabs: {

            // https://developer.chrome.com/extensions/tabs#method-create
            create: function (createProperties, callback) {
                callback = callback || _nop;
                var tab = new _Tab(createProperties);
                setTimeout(function () {
                    callback(tab);
                }, 0);
            },

            // https://developer.chrome.com/extensions/tabs#method-query
            query: function (queryInfo, callback) {
                callback = callback || _nop;
                var result = [],
                    properties = Object.keys(queryInfo),
                    pos = properties.indexOf("currentWindow");
                if (-1 < pos) {
                    // Assuming only one window
                    properties.splice(pos, 1);
                }
                Object.keys(_tabs).forEach(function (tabId) {
                    var tab = _tabs[tabId];
                    result.push(tab);
                    properties.every(function (property) {
                        if (tab[property] !== queryInfo[property]) {
                            result.pop(); // Not matching
                            return false;
                        }
                        return true;
                    });
                });
                setTimeout(function () {
                    callback(result);
                }, 0);
            },

            // https://developer.chrome.com/extensions/tabs#method-remove
            remove: function (tabIds, callback) {
                if (!(tabIds instanceof Array)) {
                    tabIds = [tabIds];
                }
                tabIds.forEach(function (tabId) {
                    var tab = _tabs[tabId];
                    if (undefined !== tab) {
                        delete _tabs[tabId];
                        _chrome.tabs.onRemoved(tabId, {
                            windowId: 0,
                            isWindowClosing: false
                        });
                    }
                });
                setTimeout(function () {
                    callback();
                }, 0);
            },

            // https://developer.chrome.com/extensions/tabs#event-onRemoved
            onRemoved: _allocateEventHandler(false)
        },

        // https://developer.chrome.com/extensions/webRequest
        webRequest: {

            // https://developer.chrome.com/extensions/webRequest#event-onBeforeRequest
            onBeforeRequest: _allocateEventHandler(true)
        }
    };

    module.exports = _chrome;

}());
