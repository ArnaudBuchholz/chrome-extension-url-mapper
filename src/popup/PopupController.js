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
        me._port = chrome.extension.connect({name: um.EXTENSION_NAME});
        me._port.onMessage.addListener(me._onMessage.bind(me));
        chrome.tabs.getSelected(null, function (tab) {
            me._tabId = tab.id;
            me._view.setTabId(tabId);
            me._postMessage(um.MSG_QUERY_STATUS);
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
            this._port.postMessage(options);
        },

        /**
         * A message is received from the service
         *
         * @param {Object} msg
         */
        _onMessage: function (msg) {
            if (um.MSG_QUERY_STATUS === msg.type) {
                if (msg.enabled) {
                    chrome.browserAction.setBadgeText({
                        tabId: this._tabId,
                        text: "ON"
                    });
                } else {
                    chrome.browserAction.setBadgeText({
                        tabId: this._tabId,
                        text: ""
                    });
                }
                this._view.setSwitchState(msg.enabled);
            }
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
