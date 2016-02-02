describe("Configuration", function () {
    "use strict";

    var URL = "https://github.com/ArnaudBuchholz/chrome-extension-url-mapper";

    var configJSON = {
            name: "test",
            mappings: []
        },
        configuration;

    before(function () {
        configuration = new um.Configuration(configJSON);
    });

    it("exposes a name", function () {
        assert("test" === configuration.getName());
    });

    it("is disabled by default", function () {
        assert(false === configuration.getIsEnabled());
    });

    it("keeps the initial configuration JSON", function () {
        assert(configJSON === configuration.toJSON());
    });


});
