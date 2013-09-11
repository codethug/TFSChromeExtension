function injectedCode () {
	
	require(['Agile/Scripts/TFS.Agile.TaskBoard.View', "Presentation/Scripts/TFS/TFS.OM",
		"Presentation/Scripts/TFS/Generated/TFS.WorkItemTracking.Constants",
		"Agile/Scripts/TFS.Agile.Utils"], function(taskBoard, t, workItemConstants, agileUtils) {

		var coreFieldNames = agileUtils.DatabaseCoreFieldRefName;

		debugger;
		
		taskBoard.TaskBoardView.prototype._updateTileColors = function(outerTileElement, taskId, tileMatchesFilter) {
		
			var colorsProvider = t.ColorsProvider.getDefault();
			if (colorsProvider.isWorkItemColorsDefined()) {
				var workItemType = this._getFormattedFieldValue(taskId, workItemConstants.CoreFieldRefNames.WorkItemType);
				var innerTileElement = $(".tbTileContent", outerTileElement);

	//			if innerTileElement.data("IsBlocked" || true)
				if (true)
				{
					// Custom
					innerTileElement.css("border-left-color", "blue")
				}
				else
				{
					// OOTB
					innerTileElement.css("border-left-color", tileMatchesFilter ? colorsProvider.getPrimaryWorkItemTypeColor(workItemType) : "")
				}

				innerTileElement.css("background-color",  tileMatchesFilter ? colorsProvider.getSecondaryWorkItemTypeColor(workItemType) : "");
			}
			
		}

	});

}

var script = document.createElement('script');
script.setAttribute("async","async");
script.appendChild(document.createTextNode('('+ injectedCode +')();'));
(document.body || document.head || document.documentElement).appendChild(script);



chrome.runtime.sendMessage({method: "getLocalStorage"}, function(localStorage) {

	console.group("TFS Extensions");
	console.log("localStorage retrieved: %O", localStorage);

	// Show blocked items as red
	if (typeof localStorage.blockedAsRed !== "undefined" && localStorage.blockedAsRed !== "false")
	{	
		var allChildWorkItems = getAllChildWorkItemsOnBoard();
		var token = document.getElementsByName("__RequestVerificationToken")[0].value;
		
		console.log("Child Work Items: %O", allChildWorkItems);
		
		var data = 
			'workItemIds=' + allChildWorkItems.join() + // '50,45,32'
			'&fields=System.Id%2CSystem.Title%2CBlocked' +
			'&__RequestVerificationToken=' + token;

		console.log("Query: %O", data);
			
		var xmlhttp=new XMLHttpRequest();
		xmlhttp.open("POST", window.location.origin + '/DefaultCollection/_api/_wit/pageWorkItems?__v=4');
		xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlhttp.onload = function () {
			// do something to response
			var jsonResult = JSON.parse(this.responseText);
			var blockedItems = determineBlockedItems(jsonResult);
			
			waitForElementToExist('tile-' + blockedItems[0], function() {
				setBlockedItemsAsRed(blockedItems);
			});
		};
		
		xmlhttp.send(data);
	}
	else
	{
		console.log("blockedAsRed disabled");
		console.groupEnd();
	}
});

// returns: ["15", "30", "55"]
function getAllChildWorkItemsOnBoard()
{
	var dataFromElement = JSON.parse(document.getElementsByClassName('aggregated-capacity-data')[0].textContent);
	var idsAsObjectProperties = dataFromElement.previousValueData["Microsoft.VSTS.Scheduling.RemainingWork"];
	var keysAsStringArray = Object.keys(idsAsObjectProperties);
	return keysAsStringArray;
}

function determineBlockedItems(data)
{
	var blockedColumnNumber = data.columns.indexOf("Microsoft.VSTS.CMMI.Blocked");
	var blockedItems = data.rows.filter(function(r) { return r[blockedColumnNumber] === "Yes" });

	var idColumnNumber = data.columns.indexOf("System.Id");
	var blockedIds = blockedItems.map(function(item) { return item[idColumnNumber]; });
	
	return blockedIds;
}

var maxAttempts = 3;
var attemptsSoFar = 0;

function waitForElementToExist(id, callback)
{
	if (attemptsSoFar === maxAttempts)
	{
		console.log("After " + maxAttempts + " attempts, we still can't find the appropriate DOM elements, so we're giving up");
		console.groupEnd();
		return;
	}
	attemptsSoFar++;

	if (document.getElementById(id) == null)
	{
		console.error("element not found: " + id + ", will try again");
		setTimeout(function() {
			waitForElementToExist(id, callback);
		}, 500);
	}
	callback();
}

function setBlockedItemsAsRed(itemArray)
{
	itemArray.forEach(function(id) {
		var outerDiv = document.getElementById('tile-' + id);
		var innerDiv = outerDiv.getElementsByClassName('tbTileContent')[0];		
		innerDiv.style["border-left-color"]="red";
	});
}