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

        enable: function () {
            this._isEnabled = true;
        },

        disable: function () {
            this._isEnabled = false;
        },

        map: function (request) {
            if (this._isEnabled) {
                var len = this._mappings.length,
                    idx,
                    override;
                for (idx = 0; idx < len; ++idx) {
                    override = this._mappings[idx].match(request);
                    if (override) {
                        return override;
                    }
                }
            }
        }

    };

    // Export
    um.Configuration = Configuration;

}());
