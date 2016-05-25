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
            _currentXHR;

        window.XMLHttpRequest.prototype.open = function () {
            var args = [].slice.call(arguments, 0);
            _currentXHR = this;
            window.dispatchEvent(new window.CustomEvent("chrome-extension-url-mapper<<xhr::open", {
                detail: args
            }));
            return _open.apply(this, args);
        };

        function _receiveExtensionOpenAnswer (event) {
            // Keep track of data
            _currentXHR._data = event.detail.data;
            // Override read-only members to remap them on custom properties updated later
            [
                "readyState",
                "response",
                "responseText",
                "responseType",
                "status",
                "statusText"
            ].forEach(function (property) {
                Object.defineProperty(_currentXHR, property, {
                    get: function () {
                        return this["_" + property];
                    }
                });
            });
        }

        window.addEventListener("chrome-extension-url-mapper>>xhr::open", _receiveExtensionOpenAnswer, false);

        window.XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
            if (undefined === this._headers) {
                this._headers =  {};
            }
            this._headers[header] = value;
            _setRequestHeader.apply(this, arguments);
        };

        window.XMLHttpRequest.prototype.send = function () {
            var args = [].slice.call(arguments, 0);
            if (undefined === this._data) {
                _send.apply(this, args);
            } else {
                _currentXHR = this;
                window.dispatchEvent(new CustomEvent("chrome-extension-url-mapper<<xhr::send", {
                    detail: {
                        data: this._data,
                        headers: this._headers,
                        timeout: this.timeout,
                        withCredentials: this.withCredentials,
                        args: args
                    }
                }));
            }
        };

        function _receiveExtensionSendAnswer (event) {
            var properties = event.detail;
            if (properties) {
                Object.keys(properties).forEach(function (property) {
                    _currentXHR["_" + property] = properties[property];
                });
            }
            if (properties.readyState && _currentXHR.onreadystatechange) {
                _currentXHR.onreadystatechange();
            }
        }

        window.addEventListener("chrome-extension-url-mapper>>xhr::send", _receiveExtensionSendAnswer, false);

        window._removeUrlMapperHook = function () {
            window.XMLHttpRequest.prototype.open = _open;
            window.removeEventListener("chrome-extension-url-mapper>>xhr::open", _receiveExtensionOpenAnswer);
            window.XMLHttpRequest.prototype.setRequestHeader = _setRequestHeader;
            window.XMLHttpRequest.prototype.send = _send;
            window.removeEventListener("chrome-extension-url-mapper>>xhr::send", _receiveExtensionSendAnswer);
        };

    };

}());
