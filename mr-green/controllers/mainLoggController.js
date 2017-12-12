var unirest = require('unirest');
var conf = require("../config/config");

// PRIVATE FUNCTIONS ####################################################################################

function updateAccountsStatus(currentStatus) {

    // get latest
    var LogAccounts = require("../models/LogAccount").dataset;
    LogAccounts.findOne({}, {}, { sort: { 'logAccount.created_at' : -1 } }, function(err, prevStatus) {

        try {
            var prevStatusComp = {
                available_to_bet: prevStatus.logAccount.available_to_bet,
                commision: prevStatus.logAccount.commision,
                exposure: prevStatus.logAccount.exposure,
                exposure_limit: prevStatus.logAccount.exposure_limit,
                discount: prevStatus.logAccount.discount,
                points: prevStatus.logAccount.points
            };
        } catch (e) {
            var prevStatusComp = ""; 
        }
        
       // if current changed
       if (JSON.stringify(prevStatusComp) != JSON.stringify(currentStatus)) {

            // add update date
            currentStatus.created_at = new Date();

            // save
            var LogAccount = require("../models/LogAccount").newDataset(currentStatus);
            LogAccount.save(function(err, saveResp) {
                if (err) {
                    console.log("ERROR writing LogAccount to DB: " + err);                        
                } 
                // console.log("ACCOUNT STATUS SAVED: " + saveResp.logAccount.created_at)
            });        
       } else {
           // console.log("ACCOUNT NOT CHANGED");
       }

    });
}

// ####################################################################################

function loggAccountStatus(domainMrGold) {
    unirest.get(domainMrGold + '/api/getFunds')
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .end(function (accountResponse) {
            var accountStatus = accountResponse.body;
            updateAccountsStatus(accountStatus);
        })
        .on('error', function(e) {
            console.log("CANNOT GET ACCOUNT STATUS: " + e);
        });
}

module.exports = { 
    loggAccountStatus: loggAccountStatus
}
