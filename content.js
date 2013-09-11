function injectedCode () {

	var settingsTag = $("#tfsExtensionSettings").eq(0);
	var extensionSettings = JSON.parse(settingsTag.html());
	
	if (extensionSettings.blockedAsRed === "true")
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
		'Agile/Scripts/TFS.Agile.TaskBoard', 
		'Agile/Scripts/TFS.Agile.TaskBoard.View', 
		"Presentation/Scripts/TFS/TFS.OM",
		"Presentation/Scripts/TFS/Generated/TFS.WorkItemTracking.Constants",
		"Agile/Scripts/TFS.Agile.Utils"], function(taskBoard, taskBoardView, t, workItemConstants, agileUtils) {

		var coreFieldNames = agileUtils.DatabaseCoreFieldRefName;

		taskBoard.TaskBoard.prototype.getModel = function()
		{
			return this._model;
		}

		var foo = taskBoard.TaskBoard.prototype.getModel();

		taskBoardView.TaskBoardView.prototype._updateTileColors = function(outerTileElement, taskId, tileMatchesFilter) {
		
			var colorsProvider = t.ColorsProvider.getDefault();
			if (colorsProvider.isWorkItemColorsDefined()) {
				var workItemType = this._getFormattedFieldValue(taskId, workItemConstants.CoreFieldRefNames.WorkItemType);

				var isBlocked = (extensionSettings.blockedAsRed === "true") && 
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