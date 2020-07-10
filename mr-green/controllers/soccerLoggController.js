var unirest = require('unirest');
var vishnu = require("../models/Vishnu");
var conf = require("../config/config");

const oddlog = conf.app.oddlog;
const log = conf.app.log;

// PRIVATE FUNCTIONS -------------------------------------------------------------------------------

// ACCOUNT #########################################################################################

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

// ODDS #########################################################################################

function updateOddsInDb(conditions, update) {
    vishnu.dataset.findOneAndUpdate(conditions, update, {upsert: true}, function(err) {
        if (err) {
            console.log("ERROR writing Odds into DB: " + err);                        
        throw err;
        } 
    });
}

function loggOddsPriv(odds, times, isInPlay) {

    var eventIds = odds.map(item => item.eventId);
    // records = await vishnu.dataset.find().where("eventId").in(eventIds).exec();

    // get saved Vishnus
    vishnu.dataset.find().where("eventId").in(eventIds).exec((err, results) => {

        //var existingEventIds = results.map(result => result.eventId);

        for (var i in odds) {

            var recordInDb = results.find(item => item.eventId == odds[i].eventId)

            try { 
                var back0priceDB = recordInDb.markets[0].selection[0].back[0].price
                var back0priceBF = odds[i].selection[0].back[0].price
                var lay0priceDB = recordInDb.markets[0].selection[0].lay[0].price
                var lay0priceBF = odds[i].selection[0].lay[0].price

                var back1priceDB = recordInDb.markets[0].selection[1].back[0].price
                var back1priceBF = odds[i].selection[1].back[0].price
                var lay1priceDB = recordInDb.markets[0].selection[1].lay[0].price
                var lay1priceBF = odds[i].selection[1].lay[0].price

                var back2priceDB = recordInDb.markets[0].selection[2].back[0].price
                var back2priceBF = odds[i].selection[2].back[0].price
                var lay2priceDB = recordInDb.markets[0].selection[2].lay[0].price
                var lay2priceBF = odds[i].selection[2].lay[0].price

                if (back0priceDB != back0priceBF) {
                    var tempArr = recordInDb.markets[0].selection[0].back
                    tempArr.unshift({
                        price: odds[i].selection[0].back[0].price,
                        size: odds[i].selection[0].back[0].size,
                        updated: new Date()})

                    var conditions = { eventId: odds[i].eventId }
                    var update = { "markets.0.selection.0.back": tempArr }

                    if (oddlog) { console.log("Iteration: " + times + ". Odds Back 0 price updated " + odds[i].eventId + " " + JSON.stringify(tempArr));

                    updateOddsInDb(conditions, update);
                }

                if (lay0priceDB != lay0priceBF) {
                    var tempArr = recordInDb.markets[0].selection[0].lay
                    tempArr.unshift({
                        price: odds[i].selection[0].lay[0].price,
                        size: odds[i].selection[0].lay[0].size,
                        updated: new Date()})

                    var conditions = { eventId: odds[i].eventId }
                    var update = { "markets.0.selection.0.lay": tempArr }

                    //console.log("Lay 0 price updated "+ odds[i].eventId + " " + JSON.stringify(tempArr));

                    updateOddsInDb(conditions, update);
                }

                //
 
                if (back1priceDB != back1priceBF) {
                    var tempArr = recordInDb.markets[0].selection[1].back
                    tempArr.unshift({
                        price: odds[i].selection[1].back[0].price,
                        size: odds[i].selection[1].back[0].size,
                        updated: new Date()})

                    var conditions = { eventId: odds[i].eventId }
                    var update = { "markets.0.selection.1.back": tempArr }

                    //console.log("Back 1 price updated "+ odds[i].eventId + " " + JSON.stringify(tempArr));

                    updateOddsInDb(conditions, update);
                }

                if (lay1priceDB != lay1priceBF) {
                    var tempArr = recordInDb.markets[0].selection[1].lay
                    tempArr.unshift({
                        price: odds[i].selection[1].lay[0].price,
                        size: odds[i].selection[1].lay[0].size,
                        updated: new Date()})

                    var conditions = { eventId: odds[i].eventId }
                    var update = { "markets.0.selection.1.lay": tempArr }

                    //console.log("Lay 1 price updated "+ odds[i].eventId + " " + JSON.stringify(tempArr));

                    updateOddsInDb(conditions, update);
                }   
                
                //

                if (back2priceDB != back2priceBF) {
                    var tempArr = recordInDb.markets[0].selection[2].back
                    tempArr.unshift({
                        price: odds[i].selection[2].back[0].price,
                        size: odds[i].selection[2].back[0].size,
                        updated: new Date()})

                    var conditions = { eventId: odds[i].eventId }
                    var update = { "markets.0.selection.2.back": tempArr }

                    //console.log("Back 2 price updated " + odds[i].eventId + " " + JSON.stringify(tempArr));

                    updateOddsInDb(conditions, update);
                }

                if (lay2priceDB != lay2priceBF) {
                    var tempArr = recordInDb.markets[0].selection[2].lay
                    tempArr.unshift({
                        price: odds[i].selection[2].lay[0].price,
                        size: odds[i].selection[2].lay[0].size,
                        updated: new Date()})

                    var conditions = { eventId: odds[i].eventId }
                    var update = { "markets.0.selection.2.lay": tempArr }

                    //console.log("Lay 2 price updated " + odds[i].eventId + " " + JSON.stringify(tempArr));

                    updateOddsInDb(conditions, update);
                }
            }   

            } catch (e) { 

                var market = { 
                    marketId: odds[i].marketId,
                    marketName: "Match Odds",
                    lastOddsUpdated: odds[i].date,
                    totalMatched: odds[i].totalMatched,
                    lastUpdated: new Date(),
                    selection: odds[i].selection
                };

                var update = {
                    eventName: odds[i].eventName,
                    country: odds[i].eventCountryIds,
                    competition: odds[i].competition,
                    markets: [market]
                }

                var conditions = { eventId: odds[i].eventId }

                //console.log("Market updated fully")

                updateOddsInDb(conditions, update);
            }

        }

        if (oddlog) { console.log("Iteration: " + times + ". Logg controller. Part update done"); }

    });

}


// ---------------------------------------------------------------------------------------------

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
    if (oddlog) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Logg controller. " + odds.length + " items recieved") }
    loggOddsPriv(odds, times, isInPlay);
}

module.exports = { 
    loggAccountStatus: loggAccountStatus,
    loggOdds: loggOdds
}
