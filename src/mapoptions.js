(function () {
    "use strict";

    /**
     * Mapping options class
     * Modify the way the request is handled
     *
     * @constructor
     */
    function MappingOptions () {
    }

    MappingOptions.prototype = {

        // @property {Boolean} Logs information about the request
        debug: false,

        // @property {Boolean} Change the answer header to inject Access-Control-Allow-Origin: <current website>
        overrideCORS: false,

        /**
         * Returns true if the options are not the default one
         *
         * @returns {Boolean}
         */
        areModified: function () {
            return 0 !== Object.keys(this).length;
        },

        /**
         * Apply the options to the given object
         *
         * @param {Object} options
         */
        apply: function (options) {
            var key;
            for (key in this) {
                if (this.hasOwnProperty(key)) {
                    options[key] = this[key];
                }
            }
        }

    };

    // Export
    um.MappingOptions = MappingOptions;

}());
