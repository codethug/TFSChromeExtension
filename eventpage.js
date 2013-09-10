chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "getLocalStorage")
      sendResponse(localStorage);
    else
      sendResponse({}); // snub them.
});
