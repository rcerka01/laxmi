var accountController = require("./accountApiController");
var bettingsController = require("./bettingsApiController");
var tokenGenerator = require("../config/tokenGenerator");

module.exports = { run: function(app) { 
        function returnValidToken(error, response, body) {
            if (!error) {
                var validToken = body.sessionToken;
                accountController(app, validToken);
                bettingsController(app, validToken);
            } else {
                console.log("Session token error: " + error);
            }
        }
        tokenGenerator(returnValidToken);
    }
}
