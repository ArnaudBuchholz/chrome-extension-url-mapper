(function () {
    "use strict";

    /**
     * Configuration class
     *
     * @param {String} tabId
     * @param {Object} configuration JSON
     * @constructor
     */
    function Configuration (tabId, configuration) {
        this._tabId = tabId;
        this._name = configuration.name;
    }

    Configuration.prototype = {

        // @property {String} Associated tab id
        _tabId: "",

        // @property {String} name
        _name: "",

        // @property {Boolean} True if the configuration is enabled
        _isEnabled: false,

        getTabId: function () {
            return this._tabId;
        },

        getName: function () {
            return this._name;
        },

        getIsEnabled: function () {
            return this._isEnabled;
        }

    };

    // Export
    um.Configuration = Configuration;

}());
