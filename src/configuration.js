(function () {
    "use strict";

    /**
     * Configuration class
     *
     * @param {String} tabId
     * @param {Object} configJSON configuration JSON
     * @constructor
     */
    function Configuration (configJSON) {
        if (configJSON) {
            this._configJSON = configJSON;
            this._name = configJSON.name;
            var mappings = this._mappings = [];
            configJSON.mappings.forEach(function (mapping) {
                mappings.push(new um.Mapping(mapping));
            });
        }
    }

    Configuration.prototype = {

        // @property {Object} Backup of the configuration
        _configJSON: null,

        // @property {String} name
        _name: "",

        // @property {um.Mapping[]} array of mappings
        _mappings: [],

        // @property {Boolean} True if the configuration is enabled
        _isEnabled: false,

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
        },

        toJSON: function () {
            return this._configJSON;
        }

    };

    // Export
    um.Configuration = Configuration;

}());
