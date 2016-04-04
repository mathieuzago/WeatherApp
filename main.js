'use strict'; 

var Positioner = require('electron-positioner');
var electron = require('electron');
var app = electron.app;
var ipc = electron.ipcMain;

var Tray = electron.Tray;
var BrowserWindow = electron.BrowserWindow;

var appIcon = null;
var trayBounds = null;

function hideWindow(){
	if (!appIcon.window) { return; }
	appIcon.window.hide();
}

function showWindow(trayPos){
	if (!appIcon.window) { return; }

	var xPos = 'Right';
	var yPos = 'bottom';
	if (trayPos !== undefined) {
		var screenSize = electron.screen.getPrimaryDisplay().workAreaSize;
		xPos = (trayPos.x < (screenSize.width / 2)) ? 'Left' : 'Right';
		yPos = (trayPos.y < (screenSize.height / 2)) ? 'top' : 'bottom';
	}

	var calcPos = appIcon.positioner.calculate(yPos + xPos, trayPos);
	appIcon.window.setPosition(calcPos.x, calcPos.y);
	appIcon.window.show();	
}

function initWindow(){
	
	appIcon.window = new BrowserWindow({
		width: 370,
		height: 368,
		show: false,
		frame: false,
		resizable: false,
		icon: __dirname + '/app/img/weather.png'
	});

  	appIcon.window.webContents.openDevTools();
	appIcon.positioner = new Positioner(appIcon.window);
	appIcon.window.loadURL('file://' + __dirname + '/index.html');
	appIcon.window.on('blur', hideWindow);
}

app.on('ready', function(){
	
	appIcon = new Tray(__dirname + '/app/img/weather.png');

	initWindow();

	appIcon.on('click', function(e, bounds){
		if (appIcon.window && appIcon.window.isVisible()) {
			return hideWindow();
		}

		trayBounds = bounds;
		showWindow(trayBounds);
	});
});

app.on('window-all-closed', function(){
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

ipc.on('app-quit', function() {
	app.quit();
});

ipc.on('app-hide', function() {
	hideWindow();
});