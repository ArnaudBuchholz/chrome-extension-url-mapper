(function () {
    "use strict";

    /**
     * Configuration class
     *
     * @param {String} tabId
     * @constructor
     */
    function Configuration (tabId) {
        this._tabId = tabId;
    }

    Configuration.prototype = {

        // @property {String} Associated tab id
        _tabId: "",

        // @property {Boolean} True if the configuration is enabled
        _isEnabled: false,

        getTabId: function () {
            return this._tabId;
        },

        getIsEnabled: function () {
            return this._isEnabled;
        }

    };

    // Export
    um.Configuration = Configuration;

}());
