(function () {
    "use strict";

    // http://stackoverflow.com/questions/13546778/how-to-communicate-between-popup-js-and-background-js-in-chrome-extension

    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById("test").addEventListener("click", function () {
            chrome.runtime.sendMessage({test: "hello world!"}, function(response) {
                alert(response);
                window.close();
            });
        });
    });

}());
