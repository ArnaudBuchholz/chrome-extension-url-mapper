(function () {
    "use strict";

    /**
     * This script is the only way to map synchronous XHR requests as webRequest redirection make them fail.
     * It partly reproduces the behavior of the background (with the configuration object).
     *
     * Communication between the window and the content script is based on synchronous custom events
     */

    function _output (method, args) {
        args.unshift("chrome-extension-url-mapper");
        console[method].apply(console, args);
    }

    function _log () {
        _output("log", [].slice.call(arguments, 0));
    }

    function _error () {
        _output("error", [].slice.call(arguments, 0));
    }

    // Override the XMLHttpRequest::open method
    function _installHook () {

        var _open = window.XMLHttpRequest.prototype.open,
            _redirectUrl;

        window.XMLHttpRequest.prototype.open = function (method, url, async) {
            var args = [].slice.call(arguments, 0);
            if (false === async) {
                _redirectUrl = undefined;
                window.dispatchEvent(new CustomEvent("chrome-extension-url-mapper/request", {
                    detail: {
                        url: url
                    }
                }));
                if (_redirectUrl) {
                    args[1] = _redirectUrl;
                }
            }
            return _open.apply(this, args);
        };

        window.addEventListener("chrome-extension-url-mapper/answer", function (event) {
            _redirectUrl = event.detail.redirectUrl;
        }, false);

    }

    var _configuration,
        _link = document.createElement("a"); // Will be used to translate relative URL to absolute ones

    window.addEventListener("chrome-extension-url-mapper/request", function (event) {
        var options = new um.MappingOptions(),
            result,
            redirectUrl;
        if (_configuration) {
            _link.href = event.detail.url;
            var request = {
                url: _link.href
            };
            result = _configuration.map(request, options);
            if (options.debug) {
                _log("synchronous XMLHttpRequest::open", request, result, options);
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
            window.dispatchEvent(new CustomEvent("chrome-extension-url-mapper/answer", {
                detail: {
                    redirectUrl: redirectUrl
                }
            }));
        }
    }, false);

    chrome.runtime.sendMessage({
        type: um.MSG_INIT_XHR_CONTENT_SCRIPT
    }, function (response) {
        if (response.configuration) {
            _configuration = new um.Configuration(0, response.configuration);
            if (response.enabled) {
                _configuration.enable();
            }
            var _scriptElement = document.createElement("script");
            _scriptElement.innerHTML = "(" + _installHook + "())";
            var child = document.firstChild;
            while (child && child.nodeType !== 1) {
                child = child.nextSibling;
            }
            if (child) {
                child.appendChild(_scriptElement);
            } else {
                _error("chrome-extension-url-mapper", "Unable to install hook");
            }
        }
    });

}());
