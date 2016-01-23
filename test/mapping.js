/*eslint-env mocha*/
/*global assert*/

/*eslint-disable max-nested-callbacks*/

describe("Mapping", function () {
    "use strict";

    describe("Simple URL (url)", function () {

        var mapping = new um.Mapping({
            url: "http://localhost/",
            redirect: "file://C:/webProject/src/"
        });

        describe("matching", function () {

            it("recognizes URL starting with the pattern", function () {
                assert(mapping.match({
                    url: "http://localhost/test"
                }));
            });

            it("ignores URL *not* starting with the pattern", function () {
                assert(!mapping.match({
                    url: "http://website.com/test"
                }));
            });

        });

        describe("overriding", function () {

            it("replaces the beginning of the URL", function () {
                var override = mapping.match({
                    url: "http://localhost/test"
                });
                assert(override);
                assert(override.redirectUrl === "file://C:/webProject/src/test");
            });

        });

    });

    describe("RegExp URL (match)", function () {

        var mapping = new um.Mapping({
            match: "http://(localhost|myWebSite.com)/",
            redirect: "file://C:/webProject/src/"
        });

        describe("matching", function () {

            it("recognizes URL starting with the pattern", function () {
                assert(mapping.match({
                    url: "http://localhost/test"
                }));
            });

            it("ignores URL *not* starting with the pattern", function () {
                assert(!mapping.match({
                    url: "http://website.com/test"
                }));
            });

        });

        describe("overriding", function () {

            it("replaces the beginning of the URL", function () {
                var override = mapping.match({
                    url: "http://myWebSite.com/test"
                });
                assert(override);
                assert(override.redirectUrl === "file://C:/webProject/src/test");
            });

            describe("with parenthesized substrings", function () {
                var mappingWithSubstrings = new um.Mapping({
                    match: "http://(localhost|myWebSite.com)/([^#]*)#(.*)",
                    redirect: "file://C:/webProject/src/$2?from=$1#$3"
                });

                it("can replace $1, $2...", function () {
                    var override = mappingWithSubstrings.match({
                        url: "http://myWebSite.com/test/index.html#main"
                    });
                    assert(override);
                    var expected = "file://C:/webProject/src/test/index.html?from=myWebSite.com#main";
                    assert(override.redirectUrl === expected);
                });

            });

        });

    });

});
