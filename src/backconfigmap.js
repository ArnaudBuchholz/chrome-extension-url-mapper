(function () {
    "use strict";

    /**
     * Background Configuration Map class
     * Manages configuration per tabId
     *
     * @constructor
     */
    function BackgroundConfigurationMap () {
    }

    BackgroundConfigurationMap.prototype = {

        // @property {Object} Dictionary mapping tabId to a BackgroundConfiguration object
        _map: {},

        /**
         * Get configuration associated to the tabId
         *
         * @param {String} tabId
         * @return {BackgroundConfiguration|undefined}
         */
        get: function (tabId) {
            return this._map[tabId];
        },

        /**
         * Set configuration associated to the tabId
         *
         * @param {String} tabId
         * @param {Object} configJSON Configuration JSON
         * @return {BackgroundConfiguration}
         */
        set: function (tabId, configJSON) {
            var configuration = new um.BackgroundConfiguration(tabId, configJSON);
            this._map[tabId] = configuration;
            return configuration;
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
    um.BackgroundConfigurationMap = BackgroundConfigurationMap;

}());
