/*
 * Primary file for the API
 *
 */

// Dependencies

var server = require("./lib/server");
var workers = require("./lib/workers");

// Declare the app
var app = {};

// Initialize the app
app.init = function() {
  // Start the server
  server.init();
  // Start the workers
  workers.init();
};

// execute
app.init();

//  Export the app
module.exports = app;
