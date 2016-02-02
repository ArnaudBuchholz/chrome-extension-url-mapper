(function () {
    "use strict";

    var _umConfiguration = um.Configuration,
        _umConfigurationMap = um.Configuration.prototype.map;

    /**
     * Background Configuration class
     * - Keep tabId association
     * - Capable of detecting forwarded requests (and keep track of the options)
     *
     * @param {String} tabId
     * @param {Object} configJSON configuration JSON
     * @extends um.Configuration
     * @constructor
     */
    function BackgroundConfiguration (tabId, configJSON) {
        _umConfiguration.apply(this, [configJSON]);
        this._tabId = tabId;
        this._options = {};
        this._redirects = {};
    }

    BackgroundConfiguration.prototype = new _umConfiguration();

    (function (members) {
        Object.keys(members).forEach(function (name) {
            BackgroundConfiguration.prototype[name] = members[name];
        });
    }({

        // @property {String} Associated tab id
        _tabId: "",

        getTabId: function () {
            return this._tabId;
        },

        /**
         * @inheritdoc um.Configuration#map
         *
         * Keep track of options to be able to retreive them on forwarded request
         */
        map: function (request, options) {
            if (this._isEnabled) {
                this._fetchRedirectedOptions(request, options);
                var override = _umConfigurationMap.apply(this, arguments);
                if (options.areModified()) {
                    this._options[request.requestId] = {
                        refCount: 1,
                        options: options
                    };
                }
                if (undefined !== override) {
                    this._saveRedirect(request,  override);
                }
                return override;
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

    }));

    // Export
    um.BackgroundConfiguration = BackgroundConfiguration;

}());
