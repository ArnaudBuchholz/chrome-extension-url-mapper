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
            if (this._urlRegExp) {
                this._urlRegExp.lastIndex = 0;
                matchResult = this._urlRegExp.exec(url);
                if (matchResult) {
                    return this._override(request, this._replaceRegExp, matchResult);
                }
            }
        },

        // Replaces the start of the URL (matching with this._urlStartWith)
        _replaceStartOfUrl: function (request) {
            return this._redirect + request.url.substr(this._urlStartWith.length);
        },

        // Replaces the the URL and regexp substrings
        _replaceRegExp: function (request, matchResult) {
            var remainingPart = request.url.substr(matchResult[0].length),
                result = this._redirect + remainingPart,
                idx = 1,
                key;
            while (matchResult.hasOwnProperty(idx)) {
                key = "$" + idx;
                if (-1 < result.indexOf(key)) {
                    result = result.split(key).join(matchResult[idx]);
                }
                ++idx;
            }
            return result;
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
