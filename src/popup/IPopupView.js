(function () {
    "use strict";

    /**
     * Popup View abstraction
     *
     * @interface
     */
    function IPopupView() {}

    IPopupView.prototype = {

        /**
         * Blocks the dialog to signal a busy state
         *
         * @param {String} busy
         */
        setBusy: function (busy) {},

        /**
         * Display the current tab identifier
         *
         * @param {String} tabId
         */
        setTabId: function (tabId) {},

        /**
         * Change ON/OFF Switch
         *
         * @param {Boolean} state True for ON, False for OFF
         */
        setSwitchState: function (state) {},

        /**
         * Display an error
         *
         * @param {String} message
         */
        showError: function (message) {},

        /**
         * Display the current configuration name
         *
         * @param {String} name
         */
        setConfigurationName: function (name) {}

    };

    // export
    um.IPopupView = IPopupView;

}());
