/*
 * Primary file for the API
 *
 */

// Dependencies
// I create the HTTP server that listen on PORT and respond with data

const http = require("http");
const https = require("https");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require("./config");
const fs = require("fs");

// Tnstantiationg the HTTP server
var httpServer = http.createServer(function(req, res) {
  unifiedServer(req, res);
});
// Start the HTTP server
httpServer.listen(config.httpPort, function() {
  console.log(`The server is listen on port ${config.httpPort}`);
});

// Tnstantiationg the HTTPS server
const httpsServerOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem")
};
var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
  unifiedServer(req, res);
});
// Start the HTTPS server
httpsServer.listen(config.httpsPort, function() {
  console.log(`The server is listen on port ${config.httpsPort}`);
});

// Define handlers
const handlers = {};
// sample handler
// handlers.sample = function(data, callback) {
//   // callback a hhtp status code and a payload object
//   callback(406, { name: "sample handler" });
// };
// Ping handler
handlers.ping = function(data, callback) {
  callback(200);
};

// Not found handler
handlers.notFound = function(data, callback) {
  callback(404);
};

// Define a request router
const router = {
  ping: handlers.ping
};

// Unified server: all the server logic for both nhttp and https createServer
const unifiedServer = function(req, res) {
  // Get the URL and parse it
  const parsedUrl = url.parse(req.url, true); // BTW 'true' means that we are getting as well the queried data (plus URL parsed)
  // Get the path from the URL
  const pathUrl = parsedUrl.pathname; // .pathname is getting the un-trimmed path
  const trimmedPath = pathUrl.replace(/^\/+|\/+$/g, ""); // the RegExp just get rid of remaining slashes in order to get a clean url

  // get the query string as an Object
  const queryStringObject = parsedUrl.query;

  // Get the http Method (Object)
  const method = req.method.toLowerCase();

  // get the headers as an object
  const headers = req.headers;

  // get the payload if any
  const decoder = new StringDecoder("utf-8");
  let buffer = "";
  req.on("data", function(data) {
    buffer += decoder.write(data);
  });

  req.on("end", function() {
    buffer += decoder.end();

    // Choose the handler the request should go to, if not found use not found handler
    const chosenHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound;

    // contruct the data object to send ti the handlers
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: buffer
    };

    // route the request to the handler specified in the router
    chosenHandler(data, function(statusCode, payload) {
      // use the status code called back from the handler, or default to 200
      statusCode = typeof statusCode == "number" ? statusCode : 200;
      // use the payload called back from the handler or default to an empty object
      payload = typeof payload == "object" ? payload : {};
      // convert the payload to a string
      const payloadString = JSON.stringify(payload);
      // return the response
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);
      // log the request path
      console.log("Returning this response:", statusCode, payloadString);
    });
  });
};
