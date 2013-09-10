
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
			setBlockedItemsAsRed(blockedItems);
		};
		
		xmlhttp.send(data);
	}
	else
	{
		console.log("blockedAsRed disabled");
	}

	console.groupEnd();
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

function setBlockedItemsAsRed(itemArray)
{
	itemArray.forEach(function(id) {
		var outerDiv = document.getElementById('tile-' + id);
		var innerDiv = outerDiv.getElementsByClassName('tbTileContent')[0];		
		innerDiv.style["border-left-color"]="red";
	});
}