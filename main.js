const electron = require('electron');
const fork = require('child_process').fork;
const path = require('path');
const url = require('url');
const app = electron.app;
const {ipcMain} = require('electron');

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

var arduinoProcessReady = true;

var odometerCount = 0;

const processConfig = {
	silent: false
}

var hardware_process = fork('./arduino_reader.js', options=processConfig);

function createWindow () {
	// Create the browser window.
	mainWindow = new BrowserWindow()

	// and load the index.html of the app.
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'v1.html'),
		protocol: 'file:',
		slashes: true
	}))
	
	//mainWindow.setFullScreen(true); // make the app full screen

	//Open the DevTools.
	//mainWindow.webContents.openDevTools()

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	})
	
	odometerCount = 0;
}

function startWorker() {
	hardware_process.send("start");
	
	setInterval(function() {
		if (arduinoProcessReady) { 
			// console.log("Main - Asking arduino_reader for data");
			hardware_process.send("get");
			arduinoProcessReady = false;
		}
	}, 100);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)
app.on('ready', startWorker)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

// Listen for async message from renderer process
ipcMain.on('renderer-to-main', (event, arg) => {
	
});

// Fires on new data from the arduino_reader process
hardware_process.on('message', (m) => {	

	// remap m from data from the arduino_reader to a display format
	
	var reportJSON = JSON.parse(m);
	
	var msPerRotation = reportJSON.dataValues[0];
	var rotationPerms = 1/msPerRotation;
	var RPM = rotationPerms * 0.000016667
	var rotationsPerHour = RPM * 60
	
	var wheelcircummiles = 0.0002
	var milesPerHour = rotationsPerHour * wheelcircummiles
	
	if (odometerCount == null) {
		odometerCount = 0;
	}
	
	var newCounts = parseInt(reportJSON.dataValues[1]);
	
	if (isNaN(odometerCount)) {
		console.log("Odometer Count is Null!");
		odometerCount = 0;
	}
	
	if (isNaN(newCounts)) {
		console.log("Newcounts is Null!");
		newCounts = 0;
	}
	
	odometerCount = odometerCount + newCounts;
	
	console.log("New Counts: " + newCounts);
	console.log("Odometer Count: " + odometerCount);
	
	var displayJSON = {
		MPH: milesPerHour,
		odometerValue: odometerCount,
		error: reportJSON.error,
	};
	
	console.log(JSON.stringify(displayJSON))
	// send the remapped data to the renderer
	mainWindow.webContents.send('main-to-renderer', JSON.stringify(displayJSON));
	arduinoProcessReady = true;
});

