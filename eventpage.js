chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "getLocalStorage")
      sendResponse(settingsHelper.getSettings()); // from settings.js
    else
      sendResponse({}); // snub them.
});