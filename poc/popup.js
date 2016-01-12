(function () {
    "use strict";

    /*
http://stackoverflow.com/questions/13546778/how-to-communicate-between-popup-js-and-background-js-in-chrome-extension
     */
    document.addEventListener("DOMContentLoaded", function () {

        document.getElementById("source").onchange = function () {
            document.querySelector("span.name").innerHTML = this.value;
            chrome.browserAction.setTitle({title: this.value});
            chrome.browserAction.setBadgeText({text: "ON"});
            chrome.browserAction.setBadgeBackgroundColor({color: "#FF0000"});
            window.close();
        };

        document.getElementById("test").addEventListener("click", function () {
            chrome.runtime.sendMessage({test: "hello world!"}, function(response) {
                alert(response);
                window.close();
            });
        });
    });

}());
