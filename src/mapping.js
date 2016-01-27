(function () {
    "use strict";

    function _readMapping (mappingObject, mappingJSON, propertiesMapping) {
        var objectProperty,
            jsonProperty;
        for (objectProperty in propertiesMapping) {
            if (propertiesMapping.hasOwnProperty(objectProperty)) {
                jsonProperty = propertiesMapping[objectProperty];
                if (mappingJSON.hasOwnProperty(jsonProperty)) {
                    mappingObject[objectProperty] = mappingJSON[jsonProperty];
                }
            }
        }
    }

    // Create the option object only if an option is specified in the mapping
    function _readOptionMapping (mappingObject, mappingJSON, propertiesMapping) {
        var objectProperty,
            jsonProperty,
            options;
        for (objectProperty in propertiesMapping) {
            if (propertiesMapping.hasOwnProperty(objectProperty)) {
                jsonProperty = propertiesMapping[objectProperty];
                if (mappingJSON.hasOwnProperty(jsonProperty)) {
                    if (undefined === options) {
                        mappingObject._options = new um.MappingOptions();
                        options = mappingObject._options;
                    }
                    options[objectProperty] = mappingJSON[jsonProperty];
                }
            }
        }
    }

    /**
     * Mapping class
     *
     * @param {Object} mappingJSON mapping JSON
     * @constructor
     */
    function Mapping (mappingJSON) {
        var url = mappingJSON[um.MAPPING_SETTING_MATCH_URL];
        if (url) {
            this._urlStartWith = url;
        } else {
            this._urlRegExp = new RegExp(mappingJSON[um.MAPPING_SETTING_MATCH_REGEXP]);
        }
        _readMapping(this, mappingJSON, {
            _blocking: um.MAPPING_SETTING_REDIRECT_BLOCK,
            _redirect: um.MAPPING_SETTING_REDIRECT_URL
        });
        _readOptionMapping(this, mappingJSON, {
            overrideCORS: um.MAPPING_SETTING_OPTION_OVR_CORS,
            debug: um.MAPPING_SETTING_OPTION_DEBUG
        });
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
