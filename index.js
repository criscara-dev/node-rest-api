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
const config = require("./lib/config");
const fs = require("fs");
const handlers = require("./lib/handlers");
const helpers = require("./lib/helpers");

// TESTING
// @TODO delete this
// const _data = require("./lib/data");
// _data.create("test", "newFile", { foo: "bar" }, function(err) {
//   console.log(`This was the error: ${err} `);
// });

// _data.read("test", "newFile1", function(err, data) {
//   console.log("This was the error ", err, "and this was the data", data);
// });

// _data.update("test", "newFile", { fizz: "buzz" }, function(err) {
//   console.log(`This was the error: ${err}`);
// });

// _data.delete("test", "newFile", function(err) {
//   console.log(`This was the error: ${err}`);
// });

// Instantiating the HTTP server
const httpServer = http.createServer(function(req, res) {
  unifiedServer(req, res);
});
// Start the HTTP server
httpServer.listen(config.httpPort, function() {
  console.log(`The server is listen on port ${config.httpPort}`);
});

// Instantiating the HTTPS server
const httpsServerOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem")
};
const httpsServer = https.createServer(httpsServerOptions, function(req, res) {
  unifiedServer(req, res);
});
// Start the HTTPS server
httpsServer.listen(config.httpsPort, function() {
  console.log(`The server is listen on port ${config.httpsPort}`);
});

// Define a request router
const router = {
  ping: handlers.ping,
  users: handlers.users,
  tokens: handlers.tokens
};

// Unified server: all the server logic for both http and https createServer
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
      payload: helpers.parseJsonToObject(buffer)
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
