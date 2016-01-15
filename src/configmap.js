(function () {
    "use strict";

    /**
     * Configuration Map class
     * Manages configuration per tabId
     *
     * @constructor
     */
    function ConfigurationMap () {
    }

    ConfigurationMap.prototype = {

        // @property {Object} Dictionary mapping tabId to a Configuration object
        _map: {},

        /**
         * Get configuration associated to the tabId
         *
         * @param {String} tabId
         * @return {Configuration|undefined}
         */
        get: function (tabId) {
            return this._map[tabId];
        },

        /**
         * Removes configuration associated to the tabId (if any)
         *
         * @param {String} tabId
         */
        clear: function (tabId) {
            delete this._map[tabId];
        }

    };

    // Export
    um.ConfigurationMap = ConfigurationMap;

}());
