(function () {
    "use strict";

    function _ignore () {}

    /**
     * Popup View abstraction
     *
     * @interface
     */
    function IPopupView () {}

    IPopupView.prototype = {

        /**
         * Blocks the dialog to signal a busy state
         *
         * @param {String} busy
         */
        setBusy: function (busy) {
            _ignore(busy);
        },

        /**
         * Display the current tab identifier
         *
         * @param {String} tabId
         */
        setTabId: function (tabId) {
            _ignore(tabId);
        },

        /**
         * Change ON/OFF Switch
         *
         * @param {Boolean} state True for ON, False for OFF
         */
        setSwitchState: function (state) {
            _ignore(state);
        },

        /**
         * Display an error
         *
         * @param {String} message
         */
        showError: function (message) {
            _ignore(message);
        },

        /**
         * Display the current configuration name
         *
         * @param {String} name
         */
        setConfigurationName: function (name) {
            _ignore(name);
        }

    };

    // export
    um.IPopupView = IPopupView;

}());
