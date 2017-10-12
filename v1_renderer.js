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
	
		var valueNumber = 0;
		var values = [];
		
		for (var key in displayJSON.chartValues) {
			if (displayJSON.chartValues.hasOwnProperty(key)) {
				var val = displayJSON.chartValues[key];
				values[valueNumber] = val;
				valueNumber++;
			}	
		}
		
		var element = document.getElementById("el2");
		element.innerHTML = String(displayJSON.switchValues.sw1)
		
		for (var i in charts) {
			charts[i].data.datasets[0].data[0] = values[i];
			charts[i].update();
		}
		
		var element2 = document.getElementById("freq");
		element2.innerHTML = String(displayJSON.freq)
	}
	// Reply on async message from renderer process
    event.sender.send('renderer-to-main', 1);
});
