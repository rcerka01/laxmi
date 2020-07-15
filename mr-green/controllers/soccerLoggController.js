var unirest = require('unirest');
var vishnu = require("../models/Vishnu");
var conf = require("../config/config");

const log = conf.app.log;
const logOdds = conf.logging.odds;
const threshold = conf.odds.threshold;

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

function isAboveThreshold(prev, curr) {
   if (prev - curr > threshold || curr - prev > threshold ) { return true; }
   return false;
}

function loggOddsPriv(data, times, isInPlay) {
    var eventIds = data.map(item => item.eventId);

    // get saved Vishnus
    vishnu.dataset.find().where("eventId").in(eventIds).exec((err, dBresults) => {
        
        for (var i in data) {

            var recordInDb;
            for (var ii in dBresults) {
                if (dBresults[ii].eventId == data[i].eventId) {
                    var recordInDb = dBresults[ii];
                }
            }

            // self healing. update competition, country, eventName or openDate if undefined
            try {
                var dbSelId0 = recordInDb.markets[0].selectionIds[0].selectionId;
                var dbSelId1 = recordInDb.markets[0].selectionIds[1].selectionId;
                var dbSelId2 = recordInDb.markets[0].selectionIds[2].selectionId;

                var dataSelId0 = data[i].selectionIds[0].selectionId;
                var dataSelId1 = data[i].selectionIds[1].selectionId;
                var dataSelId2 = data[i].selectionIds[2].selectionId;
            } catch (e) {
                var dbSelId0 = "cat";
                var dbSelId1 = "cat";
                var dbSelId2 = "cat";

                var dataSelId0 = "dog";
                var dataSelId1 = "dog";
                var dataSelId1 = "dog";
            } 
            if (recordInDb.competition != data[i].competition ||
                recordInDb.eventName != data[i].eventName ||
                recordInDb.country != data[i].eventCountryIds ||
                recordInDb.openDate != data[i].openDate ||
                dbSelId0 != dataSelId0 || dbSelId1 != dataSelId1 || dbSelId2 != dataSelId2
                ) {
                    var conditions = { eventId: data[i].eventId }
                    var update = {
                        "eventName": data[i].eventName,
                        "country": data[i].eventCountryIds,
                        "competition": data[i].competition,
                        "openDate": data[i].openDate,
                        "markets.0.selectionIds": data[i].selectionIds
                    }
                    updateOddsInDb(conditions, update);
                    if (logOdds) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Self healing. Vishnu properies updated for event: " + data[i].eventId); }
            }

            try { 
                var back0priceDB = recordInDb.markets[0].selection[0].back[0].price
                var back0priceBF = data[i].odds[0].back[0].price
                var lay0priceDB = recordInDb.markets[0].selection[0].lay[0].price
                var lay0priceBF = data[i].odds[0].lay[0].price

                var back1priceDB = recordInDb.markets[0].selection[1].back[0].price
                var back1priceBF = data[i].odds[1].back[0].price
                var lay1priceDB = recordInDb.markets[0].selection[1].lay[0].price
                var lay1priceBF = data[i].odds[1].lay[0].price

                var back2priceDB = recordInDb.markets[0].selection[2].back[0].price
                var back2priceBF = data[i].odds[2].back[0].price
                var lay2priceDB = recordInDb.markets[0].selection[2].lay[0].price
                var lay2priceBF = data[i].odds[2].lay[0].price

                // 0.
                if (back0priceDB != back0priceBF && isAboveThreshold(back0priceDB, back0priceBF)) {
                    var tempArr = recordInDb.markets[0].selection[0].back
                    tempArr.unshift({
                        price: data[i].odds[0].back[0].price,
                        size: data[i].odds[0].back[0].size,
                        updated: new Date(),
                        isInPlay: isInPlay})

                    var conditions = { eventId: data[i].eventId }
                    var update = { "markets.0.selection.0.back": tempArr }

                    updateOddsInDb(conditions, update);
                    if (logOdds) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Odds Back 0 price updated " + data[i].eventId); }


                if (lay0priceDB != lay0priceBF && isAboveThreshold(lay0priceDB, lay0priceBF)) {
                    var tempArr = recordInDb.markets[0].selection[0].lay
                    tempArr.unshift({
                        price: data[i].odds[0].lay[0].price,
                        size: data[i].odds[0].lay[0].size,
                        updated: new Date(),
                        isInPlay: isInPlay})

                    var conditions = { eventId: data[i].eventId }
                    var update = { "markets.0.selection.0.lay": tempArr }

                    updateOddsInDb(conditions, update);
                    if (logOdds) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Odds Lay 0 price updated " + data[i].eventId); }
                }

                // 1.
                if (back1priceDB != back1priceBF && isAboveThreshold(back1priceDB, back1priceBF)) {
                    var tempArr = recordInDb.markets[0].selection[1].back
                    tempArr.unshift({
                        price: data[i].odds[1].back[0].price,
                        size: data[i].odds[1].back[0].size,
                        updated: new Date(),
                        isInPlay: isInPlay})

                    var conditions = { eventId: data[i].eventId }
                    var update = { "markets.0.selection.1.back": tempArr }

                    updateOddsInDb(conditions, update);
                    if (logOdds) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Odds Back 1 price updated " + data[i].eventId); }
                }

                if (lay1priceDB != lay1priceBF && isAboveThreshold(lay1priceDB, lay1priceBF)) {
                    var tempArr = recordInDb.markets[0].selection[1].lay
                    tempArr.unshift({
                        price: data[i].odds[1].lay[0].price,
                        size: data[i].odds[1].lay[0].size,
                        updated: new Date(),
                        isInPlay: isInPlay})

                    var conditions = { eventId: data[i].eventId }
                    var update = { "markets.0.selection.1.lay": tempArr }

                    updateOddsInDb(conditions, update);
                    if (logOdds) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Odds Lay 1 price updated " + data[i].eventId); }
                }   
                
                // 2.
                if (back2priceDB != back2priceBF && isAboveThreshold(back2priceDB, back2priceBF)) {
                    var tempArr = recordInDb.markets[0].selection[2].back
                    tempArr.unshift({
                        price: data[i].odds[2].back[0].price,
                        size: data[i].odds[2].back[0].size,
                        updated: new Date(),
                        isInPlay: isInPlay})

                    var conditions = { eventId: data[i].eventId }
                    var update = { "markets.0.selection.2.back": tempArr }

                    updateOddsInDb(conditions, update);
                    if (logOdds) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Odds Back 2 price updated " + data[i].eventId); }
                }

                if (lay2priceDB != lay2priceBF && isAboveThreshold(lay2priceDB, lay2priceBF)) {
                    var tempArr = recordInDb.markets[0].selection[2].lay
                    tempArr.unshift({
                        price: data[i].odds[2].lay[0].price,
                        size: data[i].odds[2].lay[0].size,
                        updated: new Date(),
                        isInPlay: isInPlay})

                    var conditions = { eventId: data[i].eventId }
                    var update = { "markets.0.selection.2.lay": tempArr }

                    updateOddsInDb(conditions, update);
                    if (logOdds) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Odds Lay 2 price updated " + data[i].eventId); }
                }
            }   

            } catch (e) { 

                var market = { 
                    marketId: data[i].marketId,
                    marketName: "Match Odds",
                    totalMatched: data[i].totalMatched,
                    created: new Date(),
                    selectionIds: data[i].selectionIds,
                    selection: data[i].odds
                };

                var update = {
                    eventId: data[i].eventId,
                    eventName: data[i].eventName,
                    country: data[i].eventCountryIds,
                    competition: data[i].competition,
                    openDate: data[i].openDate,
                    markets: [market]
                }

                var conditions = { eventId: data[i].eventId }

                updateOddsInDb(conditions, update);
                if (logOdds) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Market updated fully"); }
            }

        }

        if (logOdds) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Logg controller. Part update done"); }
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

function loggOdds(data, times, isInPlay) {
    if (logOdds) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Logg controller. " + data.length + " items recieved") }
    loggOddsPriv(data, times, isInPlay);
}

module.exports = { 
    loggAccountStatus: loggAccountStatus,
    loggOdds: loggOdds
}
