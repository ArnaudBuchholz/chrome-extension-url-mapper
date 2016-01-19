(function () {
    "use strict";

    /**
     * Configuration class
     *
     * @param {String} tabId
     * @param {Object} configuration JSON
     * @constructor
     */
    function Configuration (tabId, configuration) {
        this._tabId = tabId;
        this._name = configuration.name;
        var mappings = this._mappings = [];
        configuration.mappings.forEach(function (mapping) {
            mappings.push(new um.Mapping(mapping));
        });
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

        enable: function () {
            this._isEnabled = true;
        },

        disable: function () {
            this._isEnabled = false;
        },

        processRequest: function (request) {
            if (!this._isEnabled) {
                return; // undefined => nothing
            }
            var idx,
                len = this._mappings.length,
                mapping,
                matchResult;
            for (idx = 0; idx < len; ++idx) {
                mapping = this._mappings[idx];
                matchResult = mapping.match(request);
                if (matchResult) {
                    return mapping.process(request, matchResult);
                }
            }



/*
            console.log(details);
            if (0 === details.url.indexOf("https://www.google.ca/images/branding/googlelogo/")) {
                return {
                    //cancel: true,
                    redirectUrl: "http://users.skynet.be/lemondeduweb/gogole/gogol.JPG"
                };
            }
*/
        }

    };

    // Export
    um.Configuration = Configuration;

}());
