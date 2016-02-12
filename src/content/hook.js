(function () {
    "use strict";

    /**
     * This hook will actually be injected in the window:
     * it overrides all XMLHttpRequest interface to communicate with the content script.
     * This script will decide if the request must be overridden (_overrideSendID will be set) or not (undefined).
     *
     * Communication between the window and the content script is based on synchronous custom events
     */

    um.hook = function () {

        var _open = window.XMLHttpRequest.prototype.open,
            _setRequestHeader = window.XMLHttpRequest.prototype.setRequestHeader,
            _send = window.XMLHttpRequest.prototype.send,
            _overrideID,
            _overriddenXHR = {};

        function _overrideXHR (xhr) {
            xhr._overrideID = _overrideID;
            _overriddenXHR[_overrideID] = xhr;
            // Override read-only members to remap them on custom properties updated later
            [
                "readyState",
                "response",
                "responseText",
                "responseType",
                "status",
                "statusText"
            ].forEach(function (property) {
                Object.defineProperty(xhr, property, {
                    get: function () {
                        return this["_" + property];
                    }
                });
            });
        }

        window.XMLHttpRequest.prototype.open = function () {
            var args = [].slice.call(arguments, 0);
            _overrideID = undefined;
            window.dispatchEvent(new CustomEvent("chrome-extension-url-mapper<<xhr::open", {
                detail: args
            }));
            if (_overrideID) {
                _overrideXHR(this);
            }
            return _open.apply(this, args);
        };
        window.addEventListener("chrome-extension-url-mapper>>xhr::open", function (event) {
            _overrideID = event.detail.id;
        }, false);

        window.XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
            if (undefined === this._headers) {
                this._headers =  {};
            }
            this._headers[header] = value;
            _setRequestHeader.apply(this, arguments);
        };

        window.XMLHttpRequest.prototype.send = function () {
            var args = [].slice.call(arguments, 0);
            if (this._overrideID) {
                window.dispatchEvent(new CustomEvent("chrome-extension-url-mapper<<xhr::send", {
                    detail: {
                        id: this._overrideID,
                        headers: this._headers,
                        timeout: this.timeout,
                        withCredentials: this.withCredentials,
                        args: args
                    }
                }));
            } else {
                _send.apply(this, args);
            }
        };
        window.addEventListener("chrome-extension-url-mapper>>xhr::send", function (event) {
            var xhr = _overriddenXHR[event.detail.id];
            if (event.detail.properties) {
                Object.keys(event.detail.xhr).forEach(function (property) {
                    xhr["_" + property] = this[property];
                }, event.detail.properties);
            }
            if (event.detail.readyState) {
                xhr.onreadystatechange.apply(xhr, event.detail.readyState);
            }
        }, false);

    };

}());
