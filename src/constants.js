(function () {
    "use strict";

    um.EXTENSION_NAME                       = "chrome-extension-url-mapper";

    um.MSG_NO_CONFIGURATION                 = "(click to select a configuration)";

    um.CONFIG_NAME                          = "name";
    um.CONFIG_INJECT                        = "inject";
    um.CONFIG_MAPPINGS                      = "mappings";

    um.MAPPING_SETTING_MATCH_URL            = "url";
    um.MAPPING_SETTING_MATCH_REGEXP         = "match";
    um.MAPPING_SETTING_REDIRECT_BLOCK       = "block";
    um.MAPPING_SETTING_REDIRECT_URL         = "redirect";
    um.MAPPING_SETTING_OPTION_DEBUG         = "debug";
    um.MAPPING_SETTING_OPTION_AC_HEADERS    = "ac-headers"; // Access-Control-Allow-Headers

    um.MSG_INIT_XHR_CONTENT_SCRIPT          = "init-xhr-content-script";
    um.MSG_QUERY_STATUS                     = "query-status";
    um.MSG_SET_CONFIGURATION                = "set-configuration";
    um.MSG_ENABLE_CONFIGURATION             = "enable-configuration";
    um.MSG_DISABLE_CONFIGURATION            = "disable-configuration";

}());
