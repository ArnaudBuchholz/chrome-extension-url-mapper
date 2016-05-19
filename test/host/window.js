(function () {
    "use strict";

    var fs = require("fs"),
        XHR_READYSTATE_UNSENT = 0,
        XHR_READYSTATE_OPENED = 1,
        XHR_READYSTATE_HEADERS_RECEIVED = 2,
        XHR_READYSTATE_LOADING = 3,
        XHR_READYSTATE_DONE = 4;

    // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
    function _XMLHttpRequest () {
        this._requestHeaders = {};
        this._responseHeaders = {};
    }

    _XMLHttpRequest.prototype = {
        _method: "",
        _url: "",
        _synchronous: false,
        _user: undefined,
        _password: undefined,
        _overriddenMimeType: undefined,
        _requestHeaders: {},
        _responseHeaders: {},

        _setReadyState: function (readyState) {
            this.readyState = readyState;
            if ("function" === typeof this.onreadystatechange) {
                this.onreadystatechange();
            }
        },

        _simulate: function () {
            var me = this;
            return [
                function () {
                    me._setReadyState(XHR_READYSTATE_OPENED);
                },
                function () {
                    return me._setReadyState(XHR_READYSTATE_HEADERS_RECEIVED);
                },
                function () {
                    me.responseText = fs.readFileSync("." + me._url).toString();
                    return me._setReadyState(XHR_READYSTATE_LOADING);
                },
                function () {
                    me.status = 200;
                    me._setReadyState(XHR_READYSTATE_DONE);
                }
            ];
        },

        //region exposed API

        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState
        readyState: XHR_READYSTATE_UNSENT,

        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/onreadystatechange
        onreadystatechange: null,

        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/abort
        abort: function () {
            this.readyState = XHR_READYSTATE_UNSENT;
            // readystatechange is not fired
        },

        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getAllResponseHeaders
        getAllResponseHeaders: function () {
            var result = [],
                headers = this._responseHeaders,
                key;
            for (key in headers) {
                if (headers.hasOwnProperty(key)) {
                    result.push(key + ": " + headers[key]);
                }
            }
            if (result.length) {
                return result.join("\r\n");
            }
            return null;
        },

        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getResponseHeader
        getResponseHeader: function (header) {
            var value = this._responseHeaders[header];
            if (undefined !== value) {
                return value;
            }
            return null;
        },

        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/open
        open: function (method, url) {
            var synchronous = arguments[2];
            this._method = method;
            this._url = url;
            if (undefined !== synchronous) {
                this._synchronous = synchronous;
            }
            this._user = arguments[3];
            this._password = arguments[4];
        },

        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType
        overrideMimeType: function (mimeType) {
            this._overriddenMimeType = mimeType;
        },

        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/send
        send: function (/*data*/) {
            var chain = this._simulate(),
                step;
            function next () {
                chain[step++]();
                if (step < chain.length) {
                    setTimeout(next, 10);
                }
            }
            if (this._synchronous) {
                chain.forEach(function (callback) {
                    callback();
                });
            } else {
                step = 0;
                setTimeout(next, 10);
            }
        },

        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader
        setRequestHeader: function (name, value) {
            this._requestHeaders[name] = value;
        }

        //endregion

    };

    function _CustomEvent (eventType, detail) {
        this.type = eventType;
        this.detail = detail;
    }

    function _addEventListener (eventType, callback) {
        var handlers = this._eventHandlers[eventType];
        if (!handlers) {
            handlers = this._eventHandlers[eventType] = [];
        }
        handlers.push(callback);
    }

    function _removeEventListener (eventType, callback) {
        var handlers = this._eventHandlers[eventType],
            pos;
        if (handlers) {
            pos = handlers.indexOf(callback);
            if (-1 < pos) {
                handlers.splice(pos, 1);
            }
        }
    }

    function _dispatchEvent (eventObject) {
        var eventType = eventObject,
            handlers = this._eventHandlers[eventType];
        if (handlers) {
            handlers.forEach(function (callback) {
                callback(eventType, eventObject);
            });
        }
    }

    module.exports = {

        _eventHandlers: {},

        XMLHttpRequest: _XMLHttpRequest,
        addEventListener: _addEventListener,
        removeEventListener: _removeEventListener,
        dispatchEvent: _dispatchEvent,

        CustomEvent: _CustomEvent

    };

}());
