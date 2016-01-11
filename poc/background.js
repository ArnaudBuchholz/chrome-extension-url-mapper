// Hook before Request to log requests
chrome.webRequest.onBeforeRequest.addListener(function (details) {
    console.log(details);
}, {
    urls: ["<all_urls>"]
});