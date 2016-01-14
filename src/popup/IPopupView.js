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
        setSwitchState: function (state) {}

    };

    // export
    um.IPopupView = IPopupView;

}());
