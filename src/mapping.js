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
            if (this._urlStartWith && 0 === url.indexOf(this._urlStartWith)) {
                return this._override(request, this._replaceStartOfUrl);
            }
            //matchResult = this._urlRegExp.exec(url);
            //if (matchResult) {
            //
            //}
        },

        // Replaces the start of the URL (matching with this._urlStartWith)
        _replaceStartOfUrl: function (request) {
            return this._redirect + request.url.substr(this._urlStartWith.length);
        },

        /**
         * Override the given request
         *
         * @param {Object} request Object received on chrome.webRequest.onBeforeRequest
         * @param {Function} buildURLCallback callback to call when building the redirect URL
         * @param {*} buildURLCallbackParam last parameter of the buildURLCallback functio
         * @return {Object} result of chrome.webRequest.onBeforeRequest
         */
        _override: function (request, buildURLCallback, buildURLCallbackParam) {
            if (this._blocking) {
                return {
                    cancel: true
                };
            }
            if (this._redirect) {
                return {
                    redirectUrl: buildURLCallback.call(this, request, buildURLCallbackParam)
                };
            }
        }

    };

    // Export
    um.Mapping = Mapping;

}());
