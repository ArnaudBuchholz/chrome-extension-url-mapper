(function () {
    "use strict";

    function _genOutput (method) {
        return function () {
            var args = [].slice.call(arguments, 0);
            args.unshift("chrome-extension-url-mapper");
            console[method].apply(console, args);
        }
    }

    um.log = _genOutput("log");
    um.error = _genOutput("error");

    var _configuration,
        _link = document.createElement("a"); // Will be used to translate relative URL to absolute ones

    function _buildInjectedScript () {
        var scriptContent = ["(" + _installHook + "());"],
            inject = _configuration.getInject();
        if (inject) {
            scriptContent.push("(function () {\r\n", inject, "\r\n}());");
        }
        return scriptContent.join("");
    }

    chrome.runtime.sendMessage({
        type: um.MSG_INIT_XHR_CONTENT_SCRIPT
    }, function (response) {
        var scriptElement,
            child;
        if (response.configuration && response.enabled) {
            _configuration = new um.Configuration(response.configuration);
            _configuration.enable();
            scriptElement = document.createElement("script");
            scriptElement.innerHTML = _buildInjectedScript();
            child = document.firstChild;
            while (child && child.nodeType !== 1) {
                child = child.nextSibling;
            }
            if (child) {
                child.appendChild(scriptElement);
            } else {
                _error("chrome-extension-url-mapper", "Unable to install hook");
            }
        }
    });

}());
