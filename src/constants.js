(function () {
    "use strict";

    var constants = {
        EXTENSION_NAME                       : "chrome-extension-url-mapper",

        MSG_NO_CONFIGURATION                 : "(click to select a configuration)",

        CONFIG_NAME                          : "name",
        CONFIG_INJECT                        : "inject",
        CONFIG_MAPPINGS                      : "mappings",

        MAPPING_SETTING_MATCH_URL            : "url",
        MAPPING_SETTING_MATCH_REGEXP         : "match",
        MAPPING_SETTING_REDIRECT_BLOCK       : "block",
        MAPPING_SETTING_REDIRECT_URL         : "redirect",
        MAPPING_SETTING_OPTION_DEBUG         : "debug",
        MAPPING_SETTING_OPTION_AC_HEADERS    : "ac-headers", // Access-Control-Allow-Headers

        MSG_INIT_XHR_CONTENT_SCRIPT          : "init-xhr-content-script",
        MSG_QUERY_STATUS                     : "query-status",
        MSG_SET_CONFIGURATION                : "set-configuration",
        MSG_ENABLE_CONFIGURATION             : "enable-configuration",
        MSG_DISABLE_CONFIGURATION            : "disable-configuration"
    };

    for (var name in constants) {
        if (constants.hasOwnProperty(name)) {
            um[name] = constants[name];
        }
    }

}());
