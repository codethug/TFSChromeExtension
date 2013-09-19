var settingsHelper = function()
{
	function getSetting(settingName, defaultValue, isBool)
	{
		// isBool is an optional parameter
		if (typeof isBool === "undefined")
			isBool = false;
			
		var setting = localStorage[settingName];
		if (typeof setting === "undefined")
			return defaultValue
		else
			// Boolean values are stored in localStorage as "true" and
			// "false", but "false" is truthy, thus...
			if (isBool)
				return setting === "false" ? false : true;
			else
				return setting;
	}

	function getSettings()
	{
		var settings = {};
		settings.blockedAsRed = getSetting("blockedAsRed", true, true);
		return settings;
	}

	function saveSettings(settings)
	{
		for (var settingName in settings)
		{
			if (settings.hasOwnProperty(settingName))
			{
				localStorage[settingName] = settings[settingName];
			}
		}
	}

	return {
		getSettings: getSettings,
		saveSettings: saveSettings
	}
}();