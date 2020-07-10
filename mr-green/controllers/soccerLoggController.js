var unirest = require('unirest');
var conf = require("../config/config");

const log = conf.app.log;

// PRIVATE FUNCTIONS ####################################################################################

function updateAccountsStatus(currentStatus, times) {

    // get latest
    var Accounts = require("../models/Account").dataset;
    Accounts.findOne({}, {}, { sort: { 'account.created_at' : -1 } }, function(err, prevStatus) {

        try {
            var prevStatusComp = {
                available_to_bet: prevStatus.account.available_to_bet,
                commision: prevStatus.account.commision,
                exposure: prevStatus.account.exposure,
                exposure_limit: prevStatus.account.exposure_limit,
                discount: prevStatus.account.discount,
                points: prevStatus.account.points
            };
        } catch (e) {
            var prevStatusComp = ""; 
        }
        
       // if current changed
       if (JSON.stringify(prevStatusComp) != JSON.stringify(currentStatus)) {

            // add update date
            currentStatus.created_at = new Date();

            // save
            var Account = require("../models/Account").newDataset(currentStatus);
            Account.save(function(err, saveResp) {
                if (err) {
                    console.log("ERROR writing LogAccount to DB: " + err);                        
                } 
                
                if (log) { console.log("Iteration: " + times + ". New account state saved: " + saveResp.account.created_at); }
            });        
       } else {
           if (log) { console.log("Iteration: " + times + ". Account state not changed"); }
       }

    });
}

// ####################################################################################

function loggAccountStatus(domainMrGold, times) {
    unirest.get(domainMrGold + '/api/getFunds')
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .end(function (accountResponse) {
            var accountStatus = accountResponse.body;
            updateAccountsStatus(accountStatus, times);
        })
        .on('error', function(e) {
            console.log("CANNOT GET ACCOUNT STATUS: " + e);
        });
}

function loggOdds(odds, times, isInPlay) {
    if (log) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Logg controller. " + odds.length + " items recieved") }
}

module.exports = { 
    loggAccountStatus: loggAccountStatus,
    loggOdds: loggOdds
}
