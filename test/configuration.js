describe("Configuration", function () {
    "use strict";

    var baseURL = "https://arnaudbuchholz.github.io/chrome-extension-url-mapper/",
        configJSON = {
            "name": "https://arnaudbuchholz.github.io/chrome-extension-url-mapper/index.html",
            "mappings": [{
                "description": "Should avoid .json substitution",
                "url": "https://arnaudbuchholz.github.io/chrome-extension-url-mapper/index.json?jquery"
            }, {
                "description": "Removes thumbs-down image",
                "url": "https://arnaudbuchholz.github.io/chrome-extension-url-mapper/thumbs-down.png",
                "block": true
            }, {
                "description": "Substitute to another website",
                "url": "https://arnaudbuchholz.github.io/chrome-extension-url-mapper/index.json?xhr",
                "redirect": "http://buchholz.free.fr/chrome-extension-url-mapper/index.json",
                "debug": true
            }, {
                "description": "Replaces https with http",
                "debug": true,
                "url": "https://arnaudbuchholz.github.io/chrome-extension-url-mapper/index.js",
                "redirect": "http://arnaudbuchholz.github.io/chrome-extension-url-mapper/index.js"
            }]
        },
        configuration;

    before(function () {
        configuration = new um.Configuration(configJSON);
    });

    it("exposes a name", function () {
        assert(configJSON.name === configuration.getName());
    });

    it("is disabled by default", function () {
        assert(false === configuration.getIsEnabled());
    });

    it("keeps the initial configuration JSON", function () {
        assert(configJSON === configuration.toJSON());
    });

    describe("disabled", function () {

        it("ignores any URL", function () {
            configJSON.mappings.forEach(function (mapping) {
                var options = new um.MappingOptions(),
                    result = configuration.map({
                        url: mapping.url
                    }, options);
                assert(false === options.areModified());
                assert(undefined === result);
            });
        });

    });

    describe("enabled", function () {

        before(function () {
            configuration.enable();
        });

        it("is enabled", function () {
            assert(true === configuration.getIsEnabled());
        });

        it("blocks unwanted URLs", function () {
            var options = new um.MappingOptions(),
                result = configuration.map({
                    url: baseURL + "thumbs-down.png"
                }, options);
            assert(false === options.areModified());
            assert(true === result.cancel);
        });

        it("redirects URLs (partially matched) and set options", function () {
            var options = new um.MappingOptions(),
                result = configuration.map({
                    url: baseURL + "index.json"
                }, options);
            assert(true === options.areModified());
            assert(true === options.debug);
            assert("http://arnaudbuchholz.github.io/chrome-extension-url-mapper/index.json" === result.redirectUrl);
        });

    });

});
