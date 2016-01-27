(function () {
    "use strict";

    /**
     * Configuration class
     *
     * @param {String} tabId
     * @param {Object} configJSON configuration JSON
     * @constructor
     */
    function Configuration (tabId, configJSON) {
        this._tabId = tabId;
        this._name = configJSON.name;
        var mappings = this._mappings = [];
        configJSON.mappings.forEach(function (mapping) {
            mappings.push(new um.Mapping(mapping));
        });
    }

    Configuration.prototype = {

        // @property {String} Associated tab id
        _tabId: "",

        // @property {String} name
        _name: "",

        // @property {um.Mapping[]} array of mappings
        _mappings: [],

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
        },

        // Enable the configuration
        enable: function () {
            this._isEnabled = true;
        },

        // Disable the configuration
        disable: function () {
            this._isEnabled = false;
        },

        /**
         * Map the current request: find a matching mapping and apply it
         *
         * @param {Object} request
         * @param {um.MappingOptions} options
         * @returns {Object|Boolean|undefined}
         */
        map: function (request, options) {
            if (this._isEnabled) {
                var len = this._mappings.length,
                    idx,
                    override;
                for (idx = 0; idx < len; ++idx) {
                    override = this._mappings[idx].match(request, options);
                    if (true === override) {
                        return; // stop there
                    }
                    if (undefined !== override) {
                        return override;
                    }
                }
            }
        }

    };

    // Export
    um.Configuration = Configuration;

}());
