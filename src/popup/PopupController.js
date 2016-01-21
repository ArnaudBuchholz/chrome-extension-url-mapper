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
        me._updateStatus = me._updateStatus.bind(me);
        chrome.tabs.query({
            currentWindow: true,
            active: true
        }, function (tabs) {
            var tab = tabs[0];
            me._tabId = tab.id;
            me._view.setTabId(tab.id);
            me._view.setBusy(true);
            me._postMessage(um.MSG_QUERY_STATUS)
                .then(me._updateStatus);
        });
    }

    PopupController.prototype = {

        // @property {um.IPopupView} View implementation
        _view: null,

        // @property {String} Current tab identifier
        _tabId: "",

        // @property {Boolean|undefined} Tri-state boolean for enabled state
        _enabled: undefined,

        /**
         * Send a message to the background service
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
            var text,
                name;
            if (response.enabled) {
                text = "ON";
            } else {
                text = "";
            }
            if (response.name) {
                name = response.name;
            } else {
                name = um.MSG_NO_CONFIGURATION;
            }
            this._enabled = response.enabled;
            chrome.browserAction.setBadgeText({tabId: this._tabId, text: text});
            this._view.setSwitchState(response.enabled);
            this._view.setConfigurationName(name);
            this._view.setBusy(false);
        },

        // Exposed API

        /**
         * Set a configuration file
         *
         * @param {String} textContent
         */
        setConfiguration: function (textContent) {
            var configuration;
            try {
                // Validate configuration
                configuration = JSON.parse(textContent);
                if ("string" !== typeof configuration.name && !(configuration.mappings instanceof Array)) {
                    throw new Error("Invalid format");
                }
            } catch (e) {
                this._view.showError(e.message);
            }
            this._view.setBusy(true);
            this._postMessage(um.MSG_SET_CONFIGURATION, {
                configuration: configuration
            })
                .then(this._updateStatus);
        },

        switchState: function () {
            var msgType;
            if (this._enabled) {
                msgType = um.MSG_DISABLE_CONFIGURATION;
            } else {
                msgType = um.MSG_ENABLE_CONFIGURATION;
            }
            this._view.setBusy(true);
            this._postMessage(msgType)
                .then(this._updateStatus);
        }

    };

    // export
    um.PopupController = PopupController;

}());
