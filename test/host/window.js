(function () {
    "use strict";

    function _nop () {}

    function _XMLHttpRequest () {
    }

    _XMLHttpRequest.prototype = {
        _method: "",
        _url: "",
        _synchronous: false,

        readyState: 0,
        onreadystatechange: _nop,

        open: function (method, url, synchronous) {
            this._method = method;
            this._url = url;
            if (undefined !== synchronous) {
                this._synchronous = synchronous;
            }
        },

        send: function () {
            // TBD
        }

    };

    var _window = {

        XMLHttpRequest: _XMLHttpRequest

    };

    module.exports = _window;

}());
