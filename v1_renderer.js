// This file is required by the v1.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {ipcRenderer} = require('electron');

// Listen for async-reply message from main process
ipcRenderer.on('main-to-renderer', (event, arg) => {  
	
	var displayJSON = JSON.parse(String(arg));

	var errorElement = document.getElementById("error");
	errorElement.innerHTML = String(displayJSON.error)
	
	if (displayJSON.error == false) {
		
		var element = document.getElementById("speed");
		element.innerHTML = String(displayJSON.MPH)
		
		var element2 = document.getElementById("odo");
		element2.innerHTML = String(displayJSON.odometerValue)
	}
	// Reply on async message from renderer process
    event.sender.send('renderer-to-main', 1);
});
