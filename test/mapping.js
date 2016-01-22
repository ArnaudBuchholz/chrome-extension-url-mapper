/*eslint-env mocha*/
/*global assert*/

/*eslint-disable max-nested-callbacks*/

describe("Mapping", function () {

    describe("Simple URL (url)", function () {

        var mapping = new um.Mapping({
            url: "http://localhost/",
            redirect: "file://C:/webProject/"
        });

        describe("matching", function () {

            it("recognizes URL starting with the pattern", function () {
                assert(mapping.match({
                    url: "http://localhost/src/test"
                }));
            });

            it("ignores URL *not* starting with the pattern", function () {
                assert(!mapping.match({
                    url: "http://website.com/src/test"
                }));
            });

        });

        describe("overriding", function () {

            it("replaces the beginning of the URL", function () {
                var override = mapping.match({
                        url: "http://localhost/src/test"
                    });
                assert(override);
                assert(override.redirectUrl === "file://C:/webProject/src/test");
            });

        });

    });

    describe("RegExp URL (match)", function () {

        var mapping = new um.Mapping({
            match: /(http:\/\/localhost|file:\/\/C:\/webProject)\/src/,
            redirect: "file://C:/webProject/"
        });

        describe("matching", function () {

            it("recognizes URL starting with the pattern", function () {
                assert(mapping.match({
                    url: "http://localhost/src/test"
                }));
            });

            it("ignores URL *not* starting with the pattern", function () {
                assert(!mapping.match({
                    url: "http://website.com/src/test"
                }));
            });

        });

    });

});
