var unirest = require('unirest');
var vishnu = require("../models/Vishnu");
var conf = require("../config/config");

const logOdds = conf.logging.odds;
const logAccount = conf.logging.account;
const threshold = conf.odds.threshold;
const writeOdds = conf.app.writeOdds;
const writeAccount = conf.app.writeAccount;


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
            if (writeAccount) {
                Account.save(function(err, saveResp) {
                    if (err) {
                        console.log("ERROR writing LogAccount to DB: " + err);                        
                    } 
                    
                    if (logAccount) { console.log("Iteration: " + times + ". New account state saved: " + saveResp.account.created_at); }
                });
            }        
        } else {
           if (logAccount) { console.log("Iteration: " + times + ". Account state not changed"); }
        }
    });
}

// ODDS #########################################################################################

function updateOddsInDb(conditions, update) {
    if (writeOdds) {
        vishnu.dataset.findOneAndUpdate(conditions, update, {upsert: true}, function(err) {
            if (err) {
                console.log("ERROR writing Odds into DB: " + err);                        
            throw err;
            } 
        });
    }
}

function isAboveThreshold(prev, curr) {
    var a = parseFloat(prev) - parseFloat(curr);
    var b = parseFloat(curr) - parseFloat(prev);
    var thr = parseFloat(threshold);
    if (a > thr) { return true; }
    if (b > thr) { return true; }
    return false;
}

function formUpdateOdds(homePriceBF, awayPriceBF, drawPriceBF, arrDB, backOrLay, isInPlay) {
    const key = "markets.0.combined." + backOrLay;
    var item = {
        home:  homePriceBF,
        away:  awayPriceBF,
        draw:  drawPriceBF,
        isInPlay: isInPlay,
        updated: new Date()
    }
    // add
    arrDB.unshift(item)
    // to save
    return { key: arrDB }
}

function saveOrUpdateEvent(dataBF, times, isInPlay, saveOrUpdate) {

    vishnu.dataset.count({ eventId: dataBF.eventId }, function (err, countDb) { 

        if (saveOrUpdate == "update") { var count = 0; }
        else { var count =  countDb }

        // if not already exist
        if (count < 1) {

            // it might happen that properties are not present in 1st responce, that is fixed by "self healing"
            var back = {
                home: dataBF.odds[0].back[0].price,
                away: dataBF.odds[1].back[0].price,
                draw: dataBF.odds[2].back[0].price,
                isInPlay: isInPlay,
                updated: new Date()
            };

            var lay = {
                home: dataBF.odds[0].lay[0].price,
                away: dataBF.odds[1].lay[0].price,
                draw: dataBF.odds[2].lay[0].price,
                isInPlay: isInPlay,
                updated: new Date()
            };

            var backLay = {
                back: [back],
                lay: [lay]
            }

            var market = { 
                marketId: dataBF.marketId,
                marketName: "Match Odds",
                created: new Date(),
                selectionIds: dataBF.selectionIds,
                combined: backLay
            };

            var update = {
                eventId: dataBF.eventId,
                eventName: dataBF.eventName,
                country: dataBF.eventCountryIds,
                competition: dataBF.competition,
                openDate: dataBF.openDate,
                markets: [market]
            }

            var conditions = { eventId: dataBF.eventId }

            updateOddsInDb(conditions, update);
            if (logOdds) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Successful " + saveOrUpdate + " operation performed for: " + dataBF.eventId); }
        } else {
            if (logOdds) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Unuccessful " + saveOrUpdate + " operation performed for: " + dataBF.eventId + ". Probably event already exist"); }
        }
    });
}

// data is one, chunked by 20 and reformated, response from /api/listMarketBet. In play, or Coming up
function loggOddsPriv(dataBF, times, isInPlay) {
    var eventIds = dataBF.map(item => item.eventId);

    // get saved Vishnus
    vishnu.dataset.find().where("eventId").in(eventIds).exec((err, dataDB) => {

        var dataBFlength = dataBF.length;
        var dataDBlength = dataDB.length;

        // main loop
        for (var i in dataBF) {

            var eventExists = true;

            // insert new event not exists
            if (dataBFlength != dataDBlength) {
                // local
                var eventIdsFromDb = dataDB.map( dbItem => dbItem.eventId)
                if (!eventIdsFromDb.includes(dataBF[i].eventId)) {
                    eventExists = false;
                    saveOrUpdateEvent(dataBF[i], times, isInPlay, "save")
                    if (logOdds) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Saving event: " + dataBF[i].eventId); }

                } 
            }
            
            // if exists
            if (eventExists) {

                //get Vishnus loop item from arry retueneed from DB
                var recordDB;
                for (var ii in dataDB) {
                    if (dataDB[ii].eventId == dataBF[i].eventId) {
                        recordDB = dataDB[ii];
                    }
                }

                // get prev odds and update if succesful
                try { 
                    var back0priceDB = recordDB.markets[0].combined.back[0].home;
                    var back0priceBF = dataBF[i].odds[0].back[0].price
                    var lay0priceDB  = recordDB.markets[0].combined.lay[0].home;
                    var lay0priceBF  = dataBF[i].odds[0].lay[0].price

                    var back1priceDB = recordDB.markets[0].combined.back[0].away;
                    var back1priceBF = dataBF[i].odds[1].back[0].price
                    var lay1priceDB  = recordDB.markets[0].combined.lay[0].away;
                    var lay1priceBF  = dataBF[i].odds[1].lay[0].price

                    var back2priceDB = recordDB.markets[0].combined.back[0].draw;
                    var back2priceBF = dataBF[i].odds[2].back[0].price
                    var lay2priceDB  = recordDB.markets[0].combined.lay[0].draw;
                    var lay2priceBF  = dataBF[i].odds[2].lay[0].price

                    // 0.
                    if (back0priceDB != back0priceBF && isAboveThreshold(back0priceDB, back0priceBF)) {
                        try { var arrDB = recordDB.markets[0].combined.back } catch(e) { var arrDB = []; }

                        // to save
                        var conditions = { eventId: dataBF[i].eventId }
                        var update = formUpdateOdds(back0priceBF, back1priceBF, back2priceBF, arrDB, "back", isInPlay)
                        updateOddsInDb(conditions, update);
                        if (logOdds) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Odds Back 0 price updated " + dataBF[i].eventId); }
                    }

                    if (lay0priceDB != lay0priceBF && isAboveThreshold(lay0priceDB, lay0priceBF)) {
                        try { var arrDB = recordDB.markets[0].combined.lay } catch(e) { var arrDB = []; }

                        // to save
                        var conditions = { eventId: dataBF[i].eventId }
                        var update = formUpdateOdds(lay0priceBF, lay1priceBF, lay2priceBF, arrDB, "lay", isInPlay)
                        updateOddsInDb(conditions, update);
                        if (logOdds) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Odds Lay 0 price updated " + dataBF[i].eventId); }
                    }

                    // 1.
                    if (back1priceDB != back1priceBF && isAboveThreshold(back1priceDB, back1priceBF)) {
                        try { var arrDB = recordDB.markets[0].combined.back } catch(e) { var arrDB = []; }

                        // to save
                        var conditions = { eventId: dataBF[i].eventId }
                        var update = formUpdateOdds(back0priceBF, back1priceBF, back2priceBF, arrDB, "back", isInPlay)
                        updateOddsInDb(conditions, update);
                        if (logOdds) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Odds Back 1 price updated " + dataBF[i].eventId); }
                    }

                    if (lay1priceDB != lay1priceBF && isAboveThreshold(lay1priceDB, lay1priceBF)) {
                        try { var arrDB = recordDB.markets[0].combined.lay } catch(e) { var arrDB = []; }

                        // to save
                        var conditions = { eventId: dataBF[i].eventId }
                        var update = formUpdateOdds(lay0priceBF, lay1priceBF, lay2priceBF, arrDB, "lay", isInPlay)
                        updateOddsInDb(conditions, update);
                        if (logOdds) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Odds Lay 1 price updated " + dataBF[i].eventId); }
                    }   
                    
                    // 2.                
                    if (back2priceDB != back2priceBF && isAboveThreshold(back2priceDB, back2priceBF)) {
                        try { var arrDB = recordDB.markets[0].combined.back } catch(e) { var arrDB = []; }

                        // to save
                        var conditions = { eventId: dataBF[i].eventId }
                        var update = formUpdateOdds(back0priceBF, back1priceBF, back2priceBF, arrDB, "back", isInPlay)
                        updateOddsInDb(conditions, update);
                        if (logOdds) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Odds Back 2 price updated " + dataBF[i].eventId); }
                    }

                    if (lay2priceDB != lay2priceBF && isAboveThreshold(lay2priceDB, lay2priceBF)) {
                        try { var arrDB = recordDB.markets[0].combined.lay } catch(e) { var arrDB = []; }

                        // to save
                        var conditions = { eventId: dataBF[i].eventId }
                        var update = formUpdateOdds(lay0priceBF, lay1priceBF, lay2priceBF, arrDB, "lay", isInPlay)
                        updateOddsInDb(conditions, update);
                        if (logOdds) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Odds Lay 2 price updated " + dataBF[i].eventId); }
                    }   

                } catch (e) { 
                    if (logOdds) { console.log("Error while updating Odds. Probably combined field not exist: " + e); }
                    saveOrUpdateEvent(dataBF[i], times, isInPlay, "update")
                }

                // SELF HEALING. update competition, country, eventName, selectionIds or openDate if undefined before
                // try BF fields
                try { var dataSelId0 = dataBF[i].selectionIds[0].selectionId; } catch(e) { var dataSelId0 = ""; }
                try { var dataSelId1 = dataBF[i].selectionIds[1].selectionId; } catch(e) { var dataSelId1 = ""; }
                try { var dataSelId2 = dataBF[i].selectionIds[2].selectionId; } catch(e) { var dataSelId2 = ""; }

                try { var competitionBF = dataBF[i].competition; } catch(e) { var competitionBF = ""; }
                try { var eventNameBF = dataBF[i].eventName; } catch(e) { var eventNameBF = ""; }
                try { var eventCountryIdsBF = dataBF[i].eventCountryIds; } catch(e) { var eventCountryIdsBF = ""; }
                try { var openDateBF = dataBF[i].openDate; } catch(e) { var openDateBF = ""; }
                try { var marketIdBF = dataBF[i].marketId; } catch(e) { var marketIdBF = ""; }

                // try DB fields
                try { var competitionDB = recordDB.competition; } catch(e) { var competitionDB = ""; }
                try { var eventNameDB = recordDB.eventName; } catch(e) { var eventNameDB = ""; }
                try { var countryDB = recordDB.country; } catch(e) { var countryDB = ""; }
                try { var openDateDB = recordDB.openDate; } catch(e) { var openDateDB = ""; }
                try { var marketIdDB = recordDB.markets[0].marketId; } catch(e) { var marketIdDB = ""; }

                try { var dbSelId0 = recordDB.markets[0].selectionIds[0].selectionId; } catch(e) { var dbSelId0 = ""; }
                try { var dbSelId1 = recordDB.markets[0].selectionIds[1].selectionId; } catch(e) { var dbSelId1 = ""; }
                try { var dbSelId2 = recordDB.markets[0].selectionIds[2].selectionId; } catch(e) { var dbSelId2 = ""; }

                if (competitionDB != competitionBF ||
                    eventNameDB != eventNameBF ||
                    countryDB != eventCountryIdsBF ||
                    openDateDB != openDateBF ||
                    marketIdDB != marketIdBF ||
                    dbSelId0 != dataSelId0 || dbSelId1 != dataSelId1 || dbSelId2 != dataSelId2
                    ) {
                        var conditions = { eventId: dataBF[i].eventId }
                        var update = {
                            "eventName": dataBF[i].eventName,
                            "country": dataBF[i].eventCountryIds,
                            "competition": dataBF[i].competition,
                            "openDate": dataBF[i].openDate,
                            "markets.0.selectionIds": dataBF[i].selectionIds,
                            "markets.0.created": new Date(),
                            "markets.0.marketName": "Match Odds",
                            "markets.0.marketId": dataBF[i].marketId
                        }
                        updateOddsInDb(conditions, update);
                        if (logOdds) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Self healing. Vishnu properies updated for event: " + dataBF[i].eventId); }
                }

            // if exists
            }

        // close main loop
        }

        if (logOdds) { console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Logg controller. Part update done"); }
  
    // close Db find
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
