(function () {
    "use strict";
    /*eslint-env node*/

    /**
     * Popup View mock
     *
     * @implements IPopupView
     * @constructor
     */
    function PopupView () {}

    PopupView.prototype = {

        // @property {Boolean} Busy state
        busy: false,

        // @property {String} Displayed tabId
        tabId: "",

        // @property {Boolean} Switch state
        state: false,

        // @property {String} Last displayed error
        error: "",

        // @property {String} Last displayed configuration name
        name: "",

        // @inheritdoc IPopupView#setBusy
        setBusy: function (busy) {
            this.busy = busy;
        },

        // @inheritdoc IPopupView#setTabId
        setTabId: function (tabId) {
            this.tabId = tabId;
        },

        // @inheritdoc IPopupView#setSwitchState
        setSwitchState: function (state) {
            this.state = state;
        },

        // @inheritdoc IPopupView#setSwitchState
        showError: function (message) {
            this.error = message;
        },

        // @inheritdoc IPopupView#setConfigurationName
        setConfigurationName: function (name) {
            this.name = name;
        }

    };

    module.exports = PopupView;

}());
