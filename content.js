function injectedCode () {

	var settingsTag = $("#tfsExtensionSettings").eq(0);
	var extensionSettings = JSON.parse(settingsTag.html());
	
	if (extensionSettings.blockedAsRed)
	{
		var modelScript = $("#taskboard script").eq(0);
		var model = JSON.parse(modelScript.html());
		// Add extra data to model and save it back to the DOM before it gets loaded

		var workItems = Object.keys(model.payload.data);
		var query = generateQuery(workItems, ['Blocked']);
		
		getData(query, function(result){
			updateModel(model, result);
			modelScript.html(JSON.stringify(model));
		}, true);
	}

	if (true || extensionSettings.bugBackgroundColor)
	{
		var colorsScript = $(".workitemype-colors").eq(0);
		var defaultColors = JSON.parse(colorsScript.html());

		var parentBugColor = {
			"PrimaryColor":"FFF2CB1D",
			"SecondaryColor":"FBB",
			"WorkItemTypeName":"Task"		
		}

		// Add bug color back to array
		defaultColors.push(parentBugColor);

		// Push data back into DOM
		colorsScript.html(JSON.stringify(defaultColors));
	}
	
	function spliceByProperty(data, propertyName, propertyValue)
	{
		var result = null;
		for (var i = 0; i < data.length; i++){
			if (data[i][propertyName] === propertyValue){
				result = data.splice(i, 1)[0]; // Remove 1 element at position i
				break; // out of for loop
			}
		}
		return result;
	}
	
	function generateQuery(workItems, fields)
	{
		// Add System.Id to the front of the list of fields
		fields.unshift("System.Id");

		var token = document.getElementsByName("__RequestVerificationToken")[0].value;
				
		var query = 
			'workItemIds=' + workItems.join() + // '50,45,32'
			'&fields=' + encodeURIComponent(fields.join()) +
			'&__RequestVerificationToken=' + token;

		return query;
	}
			
	function getData(query, callback, synchronous)
	{
		if (typeof synchronous === "undefined" || synchronous == null) { synchronous = false; }

		var xmlhttp=new XMLHttpRequest();
		xmlhttp.open("POST", window.location.origin + '/DefaultCollection/_api/_wit/pageWorkItems?__v=4', !synchronous);
		xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlhttp.onload = function () {
			// do something to response
			var jsonResult = JSON.parse(this.responseText);
			return callback(jsonResult);
		};
		
		xmlhttp.send(query);
	}

	function updateModel(model, newData)
	{
		// Remove System.Id from list of columns
		newData.columns.shift();
		// Add the columns to our array of columns
		model.payload.columns = model.payload.columns.concat(newData.columns);
			
		// Add the data for each item
		newData.rows.forEach(function(row, index){
			// get the id and remove it from the row			
			var id = row.shift();
			// add the rest of the data to our model
			model.payload.data[id] = model.payload.data[id].concat(row); 
		});
	}

	require([
		"Agile/Scripts/TFS.Agile.TaskBoard.View", 
		"Presentation/Scripts/TFS/TFS.OM",
		"Presentation/Scripts/TFS/Generated/TFS.WorkItemTracking.Constants",
		], function(taskBoardView, tfs, workItemConstants) {

		taskBoardView.TaskBoardView.prototype._updateTileColors = function(outerTileElement, taskId, tileMatchesFilter) {
			var colorsProvider = tfs.ColorsProvider.getDefault();
			if (colorsProvider.isWorkItemColorsDefined()) {
				var workItemType = this._getFormattedFieldValue(taskId, workItemConstants.CoreFieldRefNames.WorkItemType);

				var isBlocked = extensionSettings.blockedAsRed && 
					(this._getFormattedFieldValue(taskId, "Microsoft.VSTS.CMMI.Blocked") === "Yes");
				
				var innerTileElement = $(".tbTileContent", outerTileElement);
				if (isBlocked)
				{
					// Custom
					innerTileElement.css("border-left-color", "Red")
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

chrome.runtime.sendMessage({method: "getLocalStorage"}, function(localStorage) {

	console.group("TFS Extensions");
	console.log("localStorage retrieved: %O", localStorage);
	console.groupEnd();

	var settingsTag = document.createElement('script');
	settingsTag.setAttribute("type", "application/json");
	settingsTag.id = "tfsExtensionSettings";
	settingsTag.appendChild(document.createTextNode(JSON.stringify(localStorage)));
	(document.body || document.head || document.documentElement).appendChild(settingsTag);

	var script = document.createElement('script');
	script.setAttribute("async","async");
	script.appendChild(document.createTextNode('('+ injectedCode +')();'));
	(document.body || document.head || document.documentElement).appendChild(script);
	
});