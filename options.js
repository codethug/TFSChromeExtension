// Save this script as `options.js`

// Saves options to localStorage.
function save_options() {
  var settings = {};
  settings.blockedAsRed = document.getElementById("blockedAsRed").checked;
  settingsHelper.saveSettings(settings);
 
  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var settings = settingsHelper.getSettings(); // from settings.js
  document.getElementById("blockedAsRed").checked = settings.blockedAsRed;
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);