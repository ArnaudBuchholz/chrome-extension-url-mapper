(function () {
    "use strict";

    /**
     * Mapping class
     *
     * @param {Object} mappingJSON mapping JSON
     * @constructor
     */
    function Mapping (mappingJSON) {
        if (mappingJSON.url) {
            this._urlStartWith = mappingJSON.url;
        } else {
            this._urlRegExp = new RegExp(mappingJSON.match);
        }
        if (mappingJSON.block) {
            this._blocking = true;
        } else {
            this._redirect = mappingJSON.redirect;
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
            }
            matchResult = this._urlRegExp.exec(url);
            return matchResult;
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
            if (this._redirect) {
                return {
                    redirectUrl: this._getRedirect(matchResult)
                };
            }
        }

    };

    // Export
    um.Mapping = Mapping;

}());
