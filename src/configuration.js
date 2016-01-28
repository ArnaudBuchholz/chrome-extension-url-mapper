(function () {
    "use strict";

    /**
     * Configuration class
     *
     * @param {String} tabId
     * @param {Object} configJSON configuration JSON
     * @constructor
     */
    function Configuration (tabId, configJSON) {
        this._tabId = tabId;
        this._name = configJSON.name;
        var mappings = this._mappings = [];
        configJSON.mappings.forEach(function (mapping) {
            mappings.push(new um.Mapping(mapping));
        });
        this._options = {};
        this._redirects = {};
    }

    Configuration.prototype = {

        // @property {String} Associated tab id
        _tabId: "",

        // @property {String} name
        _name: "",

        // @property {um.Mapping[]} array of mappings
        _mappings: [],

        // @property {Boolean} True if the configuration is enabled
        _isEnabled: false,

        getTabId: function () {
            return this._tabId;
        },

        getName: function () {
            return this._name;
        },

        getIsEnabled: function () {
            return this._isEnabled;
        },

        // Enable the configuration
        enable: function () {
            this._isEnabled = true;
        },

        // Disable the configuration
        disable: function () {
            this._isEnabled = false;
        },

        /**
         * Map the current request: find a matching mapping and apply it
         *
         * @param {Object} request
         * @param {um.MappingOptions} options
         * @returns {Object|Boolean|undefined}
         */
        map: function (request, options) {
            if (this._isEnabled) {
                this._fetchRedirectedOptions(request, options);
                var len = this._mappings.length,
                    idx,
                    override;
                for (idx = 0; idx < len; ++idx) {
                    override = this._mappings[idx].match(request, options);
                    if (options.areModified()) {
                        this._options[request.requestId] = {
                            refCount: 1,
                            options: options
                        };
                    }
                    if (true === override) {
                        return; // stop there
                    }
                    if (undefined !== override) {
                        this._saveRedirect(request,  override);
                        return override;
                    }
                }
            }
        },

        // @property {Object} Dictionary of requestId to an option smart pointer
        _options: {},

        /**
         * Retrieve the options associated to the request
         *
         * @param {Object} request
         * @param {Boolean} release release the options
         * @return {Object|undefined}
         */
        getOptions: function (request, release) {
            var optionsPtr = this._options[request.requestId];
            if (optionsPtr) {
                if (release) {
                    this.releaseOptions(request);
                }
                return optionsPtr.options;
            }
        },

        /**
         * Clean the options associated to the request
         *
         * @param {Object} request
         */
        releaseOptions: function (request) {
            var requestId = request.requestId,
                optionsPtr = this._options[requestId];
            if (optionsPtr) {
                if (0 === --optionsPtr.refCount) {
                    delete this._options[requestId];
                }
            }
        },

        // @property {Object} Dictionary of redirectURL to list of originating requestID
        _redirects: {},

        // Identify initial request if request results of a redirect and get options
        _fetchRedirectedOptions: function (request, options) {
            var url = request.url,
                requestIds = this._redirects[url],
                previousRequestId,
                previousRequestOptionsPtr;
            if (requestIds) {
                previousRequestId  = requestIds.pop();
                if (0 === requestIds.length) {
                    delete this._redirects[url];
                }
                previousRequestOptionsPtr = this._options[previousRequestId];
                previousRequestOptionsPtr.options.apply(options);
                this.releaseOptions(previousRequestId);
                if (options.debug) {
                    console.log("tabId:", request.tabId, "requestId:", request.requestId,
                        "\u00AB from requestId: ", previousRequestId);
                }
            }
        },

        // If a redirect occurs, we want to be able to identify the subsequent request
        _saveRedirect: function (request, override) {
            var url = override.redirectUrl,
                requestIds,
                requestId,
                optionsPtr;
            if (url) {
                requestIds = this._redirects[url];
                if (undefined === requestIds) {
                    requestIds = [];
                    this._redirects[url] = requestIds;
                }
                requestId = request.requestId;
                requestIds.push(requestId);
                // Increase the smart pointer to be able to fetch the options *after* the initial request completes
                optionsPtr =  this._options[requestId];
                if (optionsPtr) {
                    ++optionsPtr.refCount;
                }
            }
        }

    };

    // Export
    um.Configuration = Configuration;

}());
