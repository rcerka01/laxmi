var request = require('request');
var conf = require("../config/config");
var mainController = require('./mainApiController');
                
var COUNT = 0;

function removeParameters(url) { return url.split('?')[0]; }

// possible issue by using req.params.attempt AND req.param.attempt
module.exports = {
    recoverFromUnauthorisedRequest: function recover(app, req, res) {
        if (typeof req.params.attempt != 'undefined') { COUNT = req.param.attempt; }
        if (COUNT <= conf.app.maxReloadToken) {
            mainController.run(app);
            request(conf.app.protocol + "://" + req.hostname  + ":" + conf.app.port 
                + removeParameters(req.url) + "?attempt=" + ++COUNT).pipe(res);
        } else {
            console.log("Unautorised requests to " + removeParameters(req.url) + " exceeded maximum attempts of " 
                + conf.app.maxReloadToken + ". Empty response generated.");
            res.json([]);
        }
    }
}
