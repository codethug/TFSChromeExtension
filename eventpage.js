chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "getLocalStorage")
      sendResponse(localStorage);
    else
      sendResponse({}); // snub them.
});

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {

  if (changeInfo.status == 'complete') {

		var regExToGetTopLevelDomain = "^https:\/\/[^\.]*\.([^\/]*)";
  
		var matches = tab.url.match(regExToGetTopLevelDomain);
		var browsingVisualStudioDotCom = (matches !== null && matches[1] === "visualstudio.com");
		if (browsingVisualStudioDotCom)
		{
				chrome.tabs.executeScript(tabId, {
				file: 'content.js',
				runAt: "document_end" // document_start, document_end, document_idle
			});
		}
	}
})