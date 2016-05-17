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

    function _addEventListener (eventName, callback) {
        var handlers = this._eventHandlers[eventName];
        if (!handlers) {
            handlers = this._eventHandlers[eventName] = [];
        }
        handlers.push(callback);
    }

    function _dispatchEvent (eventName, eventObject) {
        var handlers = this._eventHandlers[eventName];
        if (handlers) {
            handlers.forEach(function (callback) {
                callback(eventName, eventObject);
            });
        }
    }

    var _window = {

        _eventHandlers: {},

        XMLHttpRequest: _XMLHttpRequest,
        addEventListener: _addEventListener,
        dispatchEvent: _dispatchEvent

    };

    module.exports = _window;

}());
