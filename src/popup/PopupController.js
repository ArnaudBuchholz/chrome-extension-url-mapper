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
                .then(me._updateStatus.bind(me));
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
         * @return {Promise<Object>}
         */
        _postMessage: function (type, options) {
            options = options || {};
            options.type = type;
            options.tabId = this._tabId;
            return new Promise(function (resolve/*, reject*/) {
                chrome.runtime.sendMessage(options, resolve);
            });
        },

        /**
         * Update configuration status in the view
         *
         * @param {Object} response
         */
        _updateStatus: function (response) {
            var text;
            if (response.enabled) {
                text = "ON";
            } else {
                text = "";
            }
            chrome.browserAction.setBadgeText({tabId: this._tabId, text: text});
            this._view.setSwitchState(response.enabled);
        },

        // Exposed API

        /**
         * Set a configuration file
         *
         * @param {String} textContent
         */
        setConfiguration: function (textContent) {
            try {
                // Validate configuration
                var configuration = JSON.parse(textContent);
                if ("string" !== typeof configuration.name && !(configuration.mappings instanceof Array)) {
                    throw {
                        message: "Invalid format"
                    };
                }
            } catch (e) {
                this._view.showError(e.message);
            }
            this._postMessage(um.MSG_SET_CONFIGURATION, {
                configuration: configuration
            })
                .then(this._updateStatus.bind(this));
        },

        switchState: function () {
        }

    };

    // export
    um.PopupController = PopupController;

}());
