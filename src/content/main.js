(function () {
    "use strict";

    function _genOutput (method) {
        return function () {
            var args = [].slice.call(arguments, 0);
            args.unshift("chrome-extension-url-mapper");
            console[method].apply(console, args);
        };
    }

    um.log = _genOutput("log");
    um.error = _genOutput("error");
    um.configuration = null;

    function _buildInjectedScript () {
        var scriptContent = ["(" + um.hook + "());"],
            inject = um.configuration.getInject();
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
            um.configuration = new um.Configuration(response.configuration);
            um.configuration.enable();
            scriptElement = document.createElement("script");
            scriptElement.innerHTML = _buildInjectedScript();
            child = document.firstChild;
            while (child && child.nodeType !== 1) {
                child = child.nextSibling;
            }
            if (child) {
                child.appendChild(scriptElement);
            } else {
                um.error("Unable to install hook");
            }
        }
    });

}());
