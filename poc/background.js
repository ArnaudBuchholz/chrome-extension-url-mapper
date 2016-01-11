(function () {
    "use strict";

    // Hook before Request to log requests
    chrome.webRequest.onBeforeRequest.addListener(function (details) {
        console.log(details);
        if (details.url === "https://www.google.ca/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png") {
            return {
                //cancel: true,
                redirectUrl: "http://users.skynet.be/lemondeduweb/gogole/gogol.JPG"
            };
        }
    }, {
        urls: ["<all_urls>"]
    }, ["blocking"]);

}());
