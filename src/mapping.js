(function () {
    "use strict";

    /**
     * Mapping class
     *
     * @param {Object} mapping JSON
     * @constructor
     */
    function Mapping (mapping) {
        if (mapping.url) {
            this._urlStartWith = mapping.url;
        } else {
            this._urlRegExp = new RegExp(mapping.match);
        }
        if (mapping.block) {
            this._blocking = true;
        } else {
            this._redirect = mapping.redirect;
        }
    }

    Mapping.prototype = {

        // @property {String} URL to match (starts with)
        _urlStartWith: "",

        // @property {RegExp} URL matcher RegExp
        _urlRegExp: null,

        // @property {Boolean} Blocks the request
        _blocking: false,

        // @property {String} Redirect URL template
        _redirect: "",

        /**
         * Match the given request
         *
         * @param {Object} request Object received on chrome.webRequest.onBeforeRequest
         * @return {*}
         * - Falsy if the mapping does not match the request
         */
        match: function (request) {
            var url = request.url,
                matchResult;
            if (this._urlStartWith) {
                return 0 === url.indexOf(this._urlStartWith);
            } else {
                matchResult = this._urlRegExp.exec(url);
                return matchResult;
            }
        },

        /**
         * Override the given request
         *
         * @param {Object} request Object received on chrome.webRequest.onBeforeRequest
         * @param {*} matchResult match result
         * @return {Object} result of chrome.webRequest.onBeforeRequest
         */
        override: function (request, matchResult) {
            if (this._blocking) {
                return {
                    cancel: true
                };
            }
        }

    };

    // Export
    um.Mapping = Mapping;

}());
