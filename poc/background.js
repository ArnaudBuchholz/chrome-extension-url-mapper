(function () {
    "use strict";

    // Hook before Request to log requests
    chrome.webRequest.onBeforeRequest.addListener(function (details) {
        console.log(details);
        if (0 === details.url.indexOf("https://www.google.ca/images/branding/googlelogo/")) {
            return {
                //cancel: true,
                redirectUrl: "http://users.skynet.be/lemondeduweb/gogole/gogol.JPG"
            };
        }
    }, {
        urls: ["<all_urls>"]
    }, ["blocking"]);

}());
