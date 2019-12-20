/*
 * Helpers for various tasks
 *
 */

// Dependencies
var config = require("./config");
var crypto = require("crypto");

// Container for all the helpers
var helpers = {};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str) {
  try {
    var obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

// Create a SHA256 hash
helpers.hash = function(str) {
  if (typeof str == "string" && str.length > 0) {
    var hash = crypto
      .createHmac("sha256", config.hashingSecret)
      .update(str)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};

// Create a string od random alphaumeric characters, of a given length
helpers.createRandomString = function(strLength) {
  strLength = typeof strLength == "number" && strLength > 0 ? strLength : false;

  if (strLength) {
    // Define all the possbile characters that can go into a string
    var possibleCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";

    // Start the final string
    var str = "";
    // Get a random char
    for (i = 1; i <= strLength; i += 1) {
      var randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      // Append the char to the string
      str += randomCharacter;
    }
    // return the final string
    return str;
  } else {
    return false;
  }
};
// Export the module
module.exports = helpers;
