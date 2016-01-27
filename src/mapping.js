(function () {
    "use strict";

    // returns true if found
    function _readMapping (mappingJSON, jsonMember, thisMember) {
        var value = mappingJSON[jsonMember];
        if (undefined !== value) {
            this[thisMember] = value;
            return true;
        }
    }

    /**
     * Mapping class
     *
     * @param {Object} mappingJSON mapping JSON
     * @constructor
     */
    function Mapping (mappingJSON) {
        if (!_readMapping.call(this, mappingJSON, um.MAPPING_SETTING_MATCH_URL, "_urlStartWith")) {
            this._urlRegExp = new RegExp(mappingJSON[um.MAPPING_SETTING_MATCH_REGEXP]);
        }
        _readMapping.call(this, mappingJSON, um.MAPPING_SETTING_REDIRECT_BLOCK, "_blocking");
        _readMapping.call(this, mappingJSON, um.MAPPING_SETTING_REDIRECT_URL, "_redirect");
        _readMapping.call(this._options, mappingJSON, um.MAPPING_SETTING_OPTION_OVR_CORS, "overrideCORS");
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

        // @property {um.MappingOptions} mapping options
        _options: new um.MappingOptions(),

        /**
         * Match the given request
         *
         * @param {Object} request Object received on chrome.webRequest.onBeforeRequest
         * @param {um.MappingOptions} options Instance receiving the mapping's specific options (if matching)
         * @return {Object|Boolean|undefined}
         */
        match: function (request, options) {
            var url = request.url,
                matchResult;
            if (this._urlStartWith && 0 === url.indexOf(this._urlStartWith)) {
                this._options.apply(options);
                return this._override(request, this._replaceStartOfUrl);
            }
            if (this._urlRegExp) {
                this._urlRegExp.lastIndex = 0;
                matchResult = this._urlRegExp.exec(url);
                if (matchResult) {
                    this._options.apply(options);
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
            return true;
        }

    };

    // Export
    um.Mapping = Mapping;

}());
