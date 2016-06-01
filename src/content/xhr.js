(function () {
    "use strict";

    /**
     * This script is the only way to map synchronous XHR requests as webRequest redirection make them fail.
     * It partly reproduces the behavior of the background (with the configuration object).
     *
     * Communication between the window and the content script is based on synchronous custom events
     */

    /**
     * Hook event
     *
     * @param {String} eventName
     * @param {Function} handler function handler(eventDetail, answer)
     */
    function _hook (eventName, handler) {
        window.addEventListener("chrome-extension-url-mapper<<xhr::" + eventName, function (eventObject) {
            handler(eventObject.detail, function (eventDetail) {
                window.dispatchEvent(new CustomEvent("chrome-extension-url-mapper>>xhr::" + eventName, {
                    detail: eventDetail
                }));
            });
        }, false);
    }

    var _link = document.createElement("a"); // Will be used to translate relative URL to absolute ones


    /**
     * Build the redirection URL
     *
     * @param {Object} mapResult Returned by um.configuration.map()
     * @returns {String|undefined} Possible redirect URL
     */
    function _buildRedirectUrl (mapResult) {
        if (mapResult) {
            if (mapResult.cancel) {
                return "about:blank"; // Didn't found better
            }
            if (mapResult.redirectUrl) {
                return mapResult.redirectUrl;
            }
        }
    }

    /**
     * Manages the XHR open
     *
     * @param {*} eventDetail
     * @param {Function} answer
     */
    function _onXhrOpen (eventDetail, answer) {
        var options = new um.MappingOptions(),
            mapResult,
            redirectUrl;
        if (um.configuration) {
            var args = eventDetail,
                request = {
                    url: _link.href
                };
            _link.href = args[1];
            mapResult = um.configuration.map(request, options);
            if (options.debug) {
                um.log("XMLHttpRequest::open", args, mapResult, options);
            }
            redirectUrl = _buildRedirectUrl(mapResult);
            if (redirectUrl) {
                answer({
                    data: {
                        method: args[0],
                        url: redirectUrl
                    }
                });
            }
        }
    }

    _hook("open", _onXhrOpen);

    /**
     * Manages the XHR send
     *
     * @param {*} eventDetail
     * @param {Function} answer
     */
    function _onXhrSend (eventDetail, answer) {
        var data = eventDetail.data,
            xhr = new XMLHttpRequest(),
            detail = {};
        xhr.open(data.method, data.url, true /*synchronous*/);
        // TODO process headers
        xhr.send();
        [
            "readyState",
            "response",
            "responseText",
            "responseType",
            "status",
            "statusText"
        ].forEach(function (property) {
            detail[property] = xhr[property];
        });
        answer(detail);
    }

    _hook("send", _onXhrSend);

}());
