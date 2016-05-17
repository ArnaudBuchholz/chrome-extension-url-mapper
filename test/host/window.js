(function () {
    "use strict";

    var fs = require("fs");

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
            this.responseText = fs.readFileSync("." + this._url).toString();
            this.status = 200;
            this.readyState = 4;
            if (!this._synchronous) {
                setTimeout(this.onreadystatechange.bind(this), 50);
            }
        }

    };

    var _window = {

        XMLHttpRequest: _XMLHttpRequest

    };

    module.exports = _window;

}());
