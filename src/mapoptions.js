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

        // @property {Boolean} Change the answer header to inject Access-Control-Allow-Origin: <current website>
        overrideCORS: false,

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
