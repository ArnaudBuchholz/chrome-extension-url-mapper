(function () {
    "use strict";

    /**
     * Popup View Controller
     *
     * @constructor
     */
    function PopupController (popupView) {
        var me = this;
        me._view = popupView;
        chrome.tabs.getSelected(null, function (tab) {
            me._tabId = tab.id;
            me._view.setTabId(tab.id);
            me._postMessage(um.MSG_QUERY_STATUS)
                .then(function (response) {
                    if (response.enabled) {
                        chrome.browserAction.setBadgeText({
                            tabId: me._tabId,
                            text: "ON"
                        });
                    } else {
                        chrome.browserAction.setBadgeText({
                            tabId: me._tabId,
                            text: ""
                        });
                    }
                    me._view.setSwitchState(response.enabled);
                });
        });
    }

    PopupController.prototype = {

        // @property {um.IPopupView} View implementation
        _view: null,

        // @property {Object} Communication channel to the service
        _port: null,

        // @property {String} Current tab identifier
        _tabId: "",

        /**
         * Send a message to the service
         *
         * @param {String} type
         * @param {Object} [options=undefined] options
         */
        _postMessage: function (type, options) {
            options = options || {};
            options.type = type;
            options.tabId = this._tabId;
            return Promise(function (resolve/*, reject*/) {
                chrome.runtime.sendMessage(options, resolve);
            });
        },

        // Exposed API

        setConfiguration: function (content) {
        },

        switchState: function () {
        }

    };

    // export
    um.PopupController = PopupController;

}());
