/***---------------------------------------------------------------------------------------
--      SOURCE FILE:        main.js - main startup script for the application
--
--      PROGRAM:            firewall_subnetwork
--
--      FUNCTIONS:          createWindow()
--                          generateBash()
--                          executeBash()
--                          quitApp
--
--      DATE:               February 13, 2016
--
--      REVISION:           (Date and Description)
--
--      DESIGNERS:          Anthony Smith and Colin Bose
--
--      PROGRAMMERS:        Anthony Smith and Colin Bose
--
--      NOTES:
--      This file is the main execution for starting the application. It builds a window
--      using electron js and then renders the index.html file to display the user
--      interface to the screeen.
---------------------------------------------------------------------------------------**/
const electron = require('electron');
// Module to communicate between native commands and the web renderer
const {ipcMain} = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
// Module to parse the template bash script
const Mustache = require('mustache');
// Misc built-in modules from nodejs
const path = require('path');
const url = require('url');
const fs = require('fs');
const exec = require('child_process').exec

const WIDTH = 1000;
const HEIGHT = 650;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  app.quit()
})


/***---------------------------------------------------------------------------------------
-- FUNCTION:   createWindow
-- DATE:       13/02/2017
-- REVISIONS:  (V1.0)
-- DESIGNER:   Anthony Smith
-- PROGRAMMER: Anthony Smith
--
-- NOTES:
-- Setups up the window with a specified width and height  Then loads index.html to be
-- renderered by the electron engine.
--------------------------------------------------------------------------------------***/
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    minWidth: WIDTH,
    minHeight: HEIGHT,
    maxWidth: WIDTH,
    maxHeight: HEIGHT
  })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  // Dereference the window object when it's closed
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}


/***---------------------------------------------------------------------------------------
-- FUNCTION:   generateBash
-- DATE:       13/02/2017
-- REVISIONS:  (V1.0)
-- DESIGNER:   Anthony Smith
-- PROGRAMMER: Anthony Smith
--
-- NOTES:
-- This method waits for a signal from the renderer before running the mustache template
-- engine that generates a bash script with the specified parameters from the user
-- interface.
--------------------------------------------------------------------------------------***/
ipcMain.on('generate-bash', (event, arg) => {
  fs.readFile('script.mst', 'utf-8', function (err, data) {
    if(err){
      event.returnValue = false;
      return;
    }

    // Use templating engine to parse our template
    var newContent = Mustache.render(data, arg.inputs);
    //console.log(newContent);
    event.returnValue = newContent;
  });
});


/***---------------------------------------------------------------------------------------
-- FUNCTION:   executeBash
-- DATE:       13/02/2017
-- REVISIONS:  (V1.0)
-- DESIGNER:   Anthony Smith
-- PROGRAMMER: Anthony Smith
--
-- NOTES:
-- This method waits for a signal from the renderer before executing the generated bash
-- that was generated from the user specified parameters
--------------------------------------------------------------------------------------***/
ipcMain.on('execute-bash', (event, arg, isClient, isReset) => {
  var runner = (isClient) ? ' client' : ' firewall';
  if (isReset) {
    var runner = ' reset';
  }

  exec(arg + runner,
    function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('error: ' + error);
        event.returnValue = false;
      }
  });

  event.returnValue = true; // success = true
})


/***---------------------------------------------------------------------------------------
-- FUNCTION:   quitApp
-- DATE:       13/02/2017
-- REVISIONS:  (V1.0)
-- DESIGNER:   Anthony Smith
-- PROGRAMMER: Anthony Smith
--
-- NOTES:
-- This method waits for a signal from the renderer that the user wants to exit the app.
--------------------------------------------------------------------------------------***/
ipcMain.on('quit-app', (event) => {
  mainWindow.close();
});
