(function () {
    "use strict";

    function _nop () {}

    function _allocateEventHandler (synchronous) {
        var listeners = [],
            handler;
        if (synchronous) {
            handler = function () {
                var args = arguments,
                    result;
                listeners.forEach(function (listener) {
                    result = listener.apply(null, args); // last one wins...
                });
                return result;
            };
        } else {
            handler = function () {
                var args = arguments;
                setTimeout(function () {
                    listeners.forEach(function (listener) {
                        listener.apply(null, args);
                    });
                }, 0);
            };
        }
        handler.addListener = function (listener) {
            listeners.push(listener);
        };
        return handler;
    }

    var _tabs = {};

    function _Tab (properties) {
        var me = this;
        // Allocate a random unique tab identifier
        do {
            me.id = String(Math.floor(Math.random() * 1000));
        } while (_tabs.hasOwnProperty(me.id));
        _tabs[me.id] = me;
        Object.keys(properties).forEach(function (key) {
            me[key] = properties[key];
        });
    }

    _Tab.prototype = {
        // @property {String} (allocated) tab identifier
        id: "",

        // @property {Boolean} tab is active
        active: false,

        // @property {String} tab is selected
        selected: false,

        // @property {String} badge text
        badgeText: "",

        // Make this tab active
        setActive: function () {
            Object.keys(_tabs).forEach(function (tabId) {
                var tab = _tabs[tabId];
                delete tab.active;
                delete tab.selected;
            });
            this.active = true;
            this.selected = true;
        }
    };

    var _chrome = {

        // https://developer.chrome.com/extensions/browserAction
        browserAction: {
            // https://developer.chrome.com/extensions/browserAction#method-setBadgeText
            setBadgeText: function (details) {
                var tab = _tabs[details.tabId];
                if (undefined !== tab) {
                    tab.badgeText = details.text;
                }
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
                    tab.setActive();
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
            onRemoved: _allocateEventHandler(false),

            // https://developer.chrome.com/extensions/tabs#event-onUpdated
            onUpdated: _allocateEventHandler(false)
        },

        // https://developer.chrome.com/extensions/webRequest
        webRequest: {

            // https://developer.chrome.com/extensions/webRequest#event-onBeforeRequest
            onBeforeRequest: _allocateEventHandler(true)
        }
    };

    module.exports = _chrome;

}());
