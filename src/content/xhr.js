(function () {
    "use strict";

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

    function _installHook () {

        // Override the XMLHttpRequest object
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
                tabId: 0,
                url: _link.href
            };
            result = _configuration.map(request, options);
            if (options.debug) {
                _log("onBeforeRequest", request, result, options);
            }
            if (result) {
                if (result.cancel) {
                    // Didn't found better
                    redirectUrl = "about:blank";
                } else if (result.redirectUrl) {
                    redirectUrl = result.redirectUrl;
                }
            }
        }
        window.dispatchEvent(new CustomEvent("chrome-extension-url-mapper/answer", {
            detail: {
                redirectUrl: redirectUrl
            }
        }));
    }, false);

    chrome.runtime.sendMessage({
        type: um.MSG_INIT_TAB
    }, function (response) {
        if (response.enabled) {
            _log("Enabled: " + response.name);
            _configuration = new um.Configuration(0, response.configuration);
            _configuration.enable();
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
