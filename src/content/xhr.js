(function () {
    "use strict";

    function _log () {
        var args = [].slice.call(arguments, 0);
        args.unshift("chrome-extension-url-mapper");
        console.log.apply(console, args);
    }

    // Override the XMLHttpRequest object
    var _open = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function (method, url, async) {
        var args = [].slice.call(arguments, 0);
        if (!async) {
            _log.apply(null, ["XHR::open not supported"].concat(args));
        }
        return _open.apply(this, args);
    };

    _log("XHR installed");

}());
