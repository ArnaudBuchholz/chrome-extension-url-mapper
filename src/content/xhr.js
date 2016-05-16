(function () {
    "use strict";

    /**
     * This script is the only way to map synchronous XHR requests as webRequest redirection make them fail.
     * It partly reproduces the behavior of the background (with the configuration object).
     *
     * Communication between the window and the content script is based on synchronous custom events
     */

    var _link = document.createElement("a"); // Will be used to translate relative URL to absolute ones

    window.addEventListener("chrome-extension-url-mapper<<xhr::open", function (event) {
        var options = new um.MappingOptions(),
            result,
            redirectUrl;
        if (um.configuration) {
            var args = event.detail.args;
            _link.href = args[1];
            var request = {
                url: _link.href
            };
            result = um.configuration.map(request, options);
            if (options.debug) {
                um.log("XMLHttpRequest::open", args, result, options);
            }
            if (result) {
                if (result.cancel) {
                    redirectUrl = "about:blank"; // Didn't found better
                } else if (result.redirectUrl) {
                    redirectUrl = result.redirectUrl;
                } else {
                    return;
                }
            }
            window.dispatchEvent(new CustomEvent("chrome-extension-url-mapper>>xhr::open", {
                detail: {
                    id: redirectUrl
                }
            }));
        }
    }, false);

}());
