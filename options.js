// Save this script as `options.js`

// Saves options to localStorage.
function save_options() {
  var blockedAsRed = document.getElementById("blockedAsRed").checked;
  localStorage["blockedAsRed"] = blockedAsRed;
 
  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var blockedAsRed = localStorage["blockedAsRed"];
  blockedAsRed = (typeof blockedAsRed === "undefined" || blockedAsRed === "false") ? false : blockedAsRed;
  document.getElementById("blockedAsRed").checked = blockedAsRed;
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);