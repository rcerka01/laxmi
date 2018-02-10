//var event = require("../models/Event").newDataset;

// var prevGameArr = [];
// function logSoccerEvents(response, times, version) {
//       var msg = response.body;

//       // if true outputs dividing line in logs
//       var updated = false;
//       // temporary current list
//       var currentList = [];
//       // total games in play
//       var total = msg.length;

//       // LOOP CURRENT -------------------------------------------------

//       // loop all recieved games (main loop)
//       for(var i in msg) {
          
//         // current game (item)
//         var item = {
//           name: msg[i].name,
//           open_date: msg[i].open_date,
//           country: msg[i].country,
//           market_count: msg[i].market_count
//         }

//         // is new flag def
//         var isNew = true;
          
//         // loop previous values in current loop
//         for(var ii in prevGameArr) {
          
//           // update
//           if (prevGameArr[ii].name == item.name &&
//             prevGameArr[ii].market_count != item.market_count) {
                
                
//                 // JSON.stringify(data1) == JSON.stringify(data2)
                
            
//             event(
//                 date = Date(),
//                 eventType = "UPDATED",
//                 gameType = "SOCCER",
//                 gameId = prevGameArr[ii].id,
//                 gameName = prevGameArr[ii].name,
//                 country = prevGameArr[ii].country,
//                 openDate = prevGameArr[ii].open_date,
//                 marketCount = prevGameArr[ii].market_count,
//                 change = "Market Count changed FROM " + prevGameArr[ii].market_count + " TO " + item.market_count,
//                 comment = "",
//                 runnerVersion = version,
//                 runnerIteration = times
//                 ).save(function(err) {
//                     if (err) {
//                         console.log("ERROR writing UPDATED soccer game to DB");                        
//                         throw err;
//                     } 
//                 });

//             updated = true;                
//           }

//           // check if new
//           if (prevGameArr[ii].name == item.name) {
//             isNew = false
//           }

//         // prev loop end
//         }

//         // output if new
//         if (isNew) {

//             event(
//                 date = Date(),
//                 eventType = "NEW",
//                 gameType = "SOCCER",
//                 gameId = item.id,
//                 gameName = item.name,
//                 coutry = item.country,
//                 openDate = item.open_date,
//                 marketCount = item.market_count,
//                 change = "New Game",
//                 comment = "",
//                 runnerVersion = version,
//                 runnerIterations = times
//                 ).save(function(err) {
//                     if (err) {
//                         console.log("ERROR writing NEW soccer game to DB");                        
//                         throw err;
//                     }
//                 });    

//             updated = true;              
//         }
          
//         currentList.push(item);

//       // main loop end
//       }

//       // is finished flag def
//       var isFinished = true;

//       // LOOP PREV ------------------------------------------------- 
      
//       // prev loop
//       for(var j in prevGameArr) {

//         //set finished flag
//         isFinished = true;

//         // current loop in prev
//         for(var jj in msg) {
//            if (prevGameArr[j].name == msg[jj].name) {
//              isFinished = false
//            }
//         }

//         // output if finished
//         if (isFinished) {
//             event(
//                 date = Date(),
//                 eventType = "FINISHED",
//                 gameType = "SOCCER",
//                 gameId = prevGameArr[j].id,
//                 gameName = prevGameArr[j].name,
//                 country = prevGameArr[j].country,
//                 openDate = prevGameArr[j].open_date,
//                 marketCount = prevGameArr[j].market_count,
//                 change = "Finished Game",
//                 comment = "",
//                 runnerVersion = version,
//                 runnerIterations = times
//                 ).save(function(err) {
//                     if (err) {
//                         console.log("ERROR writing FINISHED soccer game to DB");                        
//                         throw err;
//                     }
//                 });    

//           updated = true;              
//         }
    
//       // prev loop end
//       }

//       // current to previous
//       prevGameArr = currentList;
//       currentList = [];
//     }
//    // ----------------------------------------------------------------------------------------------------- >
var unirest = require('unirest');
var conf = require("../config/config");

// PRIVATE FUNCTIONS ####################################################################################

function saveSingleMarketLog(marketId, eventId, domainMrGold) {

    unirest.get(domainMrGold + '/api/listMarketBet/' + marketId)
    .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
    .end(function (marketBetResponse) {

        // add marketId and eventId
        var marketBet = marketBetResponse.body;
        var finishedMarketBet = {
            market:marketBet[0],
            marketId: marketId,
            eventId: eventId
        }

        // save if unique
        var LogMarkets = require("../models/LogMarket");
        LogMarkets.dataset.count({"logMarket.eventId": eventId}, function (err, count){ 
            if (count > 0) {
                // market already exist
            } else {
                var LogMarket = require("../models/LogMarket").newDataset(finishedMarketBet);
                LogMarket.save(function(err, saveResp) {
                    if (err) {
                        console.log("ERROR writing LogMarket to DB: " + err);                        
                    } 
                    // console.log("MARKET SAVED: " + saveResp.logMarket.eventId)
                });
            }
        });

    })
    .on('error', function(e) {
        console.log("CANNOT GET SINGLE MARKET BET LOGS: " + e);
    });
}

// ####################################################################################

function saveNewGame(status) {
    // check if game not already exist
    var LogGames = require("../models/LogGame");
    LogGames.dataset.count({"logGame.eventId": status.eventId}, function (err, count){ 
        if (count > 0) {
            // game already exist
        } else {
            // save new LogGame
            var LogGame = require("../models/LogGame").newDataset(status);
            LogGame.save(function(err, saveResp) {
                if (err) {
                    console.log("ERROR writing LogGame to DB: " + err);                        
                } 
                // console.log("GAME SAVED: " + saveResp.logGame.eventId)
            });
        }
    }); 
}

// ####################################################################################

function logMarketBet(marketId, gameStatus, domainMrGold, isStatusLog) {
    
    unirest.get(domainMrGold + '/api/listMarketBet/' + marketId)
    .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
    .end(function (marketBetResponse) {

        var marketBet = marketBetResponse.body;

        // is Status Log
        if (isStatusLog) {

            try { var zeroSelId = marketBet[0].item.runners[0].selectionId } catch(e) { var zeroSelId = "unknown" }
            try { var zeroStat = marketBet[0].item.runners[0].status } catch(e) { var zeroStat = "unknown" }
            try { var zeroBackPrice = marketBet[0].item.runners[0].ex.availableToBack[0].price } catch(e) { var zeroBackPrice ="unknown" }
            try { var zeroBackSize = marketBet[0].item.runners[0].ex.availableToBack[0].size } catch(e) { var zeroBackSize = "unknown" }
            try { var zeroLayPrice = marketBet[0].item.runners[0].ex.availableToLay[0].price } catch(e) { var zeroLayPrice = "unknown" }
            try { var zeroLaySize = marketBet[0].item.runners[0].ex.availableToLay[0].size  } catch(e) { var zeroLaySize = "unknown" }  
            
            try { var oneSelId = marketBet[0].item.runners[1].selectionId } catch(e) { var oneSelId = "unknown" }
            try { var oneStat = marketBet[0].item.runners[1].status } catch(e) { var oneStat = "unknown" }
            try { var oneBackPrice = marketBet[0].item.runners[1].ex.availableToBack[0].price } catch(e) { var oneBackPrice = "unknown" }
            try { var oneBackSize = marketBet[0].item.runners[1].ex.availableToBack[0].size } catch(e) { var oneBackSize = "unknown" }
            try { var oneLayPrice = marketBet[0].item.runners[1].ex.availableToLay[0].price } catch(e) { var oneLayPrice = "unknown" }
            try { var oneLaySize = marketBet[0].item.runners[1].ex.availableToLay[0].size  } catch(e) { var oneLaySize = "unknown" }

            try { var twoSelId = marketBet[0].item.runners[2].selectionId } catch(e) { var twoSelId = "unknown" }
            try { var twoStat = marketBet[0].item.runners[2].status } catch(e) { var twoStat = "unknown" }
            try { var twoBackPrice = marketBet[0].item.runners[2].ex.availableToBack[0].price } catch(e) { var twoBackPrice = "unknown" }
            try { var twoBackSize = marketBet[0].item.runners[2].ex.availableToBack[0].size } catch(e) { var twoBackSize = "unknown" }
            try { var twoLayPrice = marketBet[0].item.runners[2].ex.availableToLay[0].price } catch(e) { var twoLayPrice = "unknown" }
            try { var twoLaySize = marketBet[0].item.runners[2].ex.availableToLay[0].size  } catch(e) { var twoLaySize = "unknown" }

            var marketBetLog = [
                (zeroSelId != 'unknown' ?
                    {
                        selectionId: zeroSelId,
                        status: (zeroStat != 'unknown' ? zeroStat : undefined),
                        backPrice: (zeroBackPrice != 'unknown' ? zeroBackPrice : undefined),
                        backSize: (zeroBackSize != 'unknown' ? zeroBackSize : undefined),
                        layPrice: (zeroLayPrice != 'unknown' ? zeroLayPrice : undefined),
                        laySize: (zeroLaySize != 'unknown' ? zeroLaySize : undefined),
                    } : undefined),
                (oneSelId != 'unknown' ?
                    {
                        selectionId: oneSelId,
                        status: (oneStat != 'unknown' ? oneStat : undefined),
                        backPrice: (oneBackPrice != 'unknown' ? oneBackPrice : undefined),
                        backSize: (oneBackSize != 'unknown' ? oneBackSize : undefined),
                        layPrice: (oneLayPrice != 'unknown' ? oneLayPrice : undefined),
                        laySize: (oneLaySize != 'unknown' ? oneLaySize : undefined),
                    } : undefined),
                (twoSelId != 'unknown' ?
                    {
                        selectionId: twoSelId,
                        status: (twoStat != 'unknown' ? twoStat : undefined),
                        backPrice: (twoBackPrice != 'unknown' ? twoBackPrice : undefined),
                        backSize: (twoBackSize != 'unknown' ? twoBackSize : undefined),
                        layPrice: (twoLayPrice != 'unknown' ? twoLayPrice : undefined),
                        laySize: (twoLaySize != 'unknown' ? twoLaySize : undefined),
                    } : undefined),
            ];

            var status = {
                gameStatus: gameStatus,
                marketBetStatus: marketBetLog
            }

            // save new LogStatus
            var LogStatus = require("../models/LogStatus").newDataset(status);
            LogStatus.save(function(err) {
                if (err) {
                    console.log("ERROR writing LogStatus to DB: " + err);                        
                } 
            });

        // if Result Log
        } else {
            // check if game is closed to save result
            if (marketBet[0].item.status == "CLOSED") {
                marketBet[0].eventId = gameStatus.eventId;

                // save new LogResult
                var LogResult = require("../models/LogResult").newDataset(marketBet);
                LogResult.save(function(err) {
                    if (err) {
                        console.log("ERROR writing LogResult to DB: " + err);                        
                    } 
                });
            }
        }
    })
    .on('error', function(e) {
        // save new LogStatus withot marketBetLog
        var LogStatus = require("../models/LogStatus").newDataset(gameStatus);
        LogStatus.save(function(err) {
            if (err) {
                console.log("ERROR writing LogStatus to DB (without marketBetLog): " + err);                        
            } 
        });
        console.log("CANNOT GET MARKET BET LOGS");
    });
}

// ####################################################################################

var prevEventIds = [];
var prevStatuses = [];

function logSoccerGames(currentStatuses, domainMrGold) {

    // get inPlay game ids
    try {
        var currentEventIds = currentStatuses.map(currentStatus => currentStatus.eventId);
    } catch(error) {
        var currentEventIds = [];
    }
    
    // CLEAN OLD GAMES ----------------------------

    for (var i in prevEventIds) {
        if (!currentEventIds.includes(prevEventIds[i])) {
           
            try { var resultMarketId = prevStatuses.filter(item => item.eventId == prevEventIds[i])[0].marketId; }
            catch (e) {resultMarketId = "undefined";}
            // call and save LogResults
            if (resultMarketId != "undefined") { 
                logMarketBet(resultMarketId, {eventId: prevEventIds[i]}, domainMrGold, false) 
            }

            prevStatuses = prevStatuses.filter(item => item.eventId != prevEventIds[i])
            prevEventIds = prevEventIds.filter(item => item != prevEventIds[i])
        }
    }

    // --------------------------------------------------------------------------------------------- >

    // loop current statuses (main loop)
    for (var i in currentStatuses) {

        // LOG SINGLE MARKET AT THE END ----------------------------

        try { var gameTime = currentStatuses[i].state.timeElapsed } catch(e) { var gameTime = 0 }

        if (gameTime >= conf.soccer.timeCollectMarketLog) {
            saveSingleMarketLog(currentStatuses[i].marketId, currentStatuses[i].eventId, domainMrGold)
        }

        // ---------------------------------------------------------
        
        // LOG EXISTING GAMES -----------------------------
        if (prevEventIds.includes(currentStatuses[i].eventId)) {

            var latestPrevEventStatus = prevStatuses
                                            .filter(item => item.eventId == currentStatuses[i].eventId)
                                            .pop();

            try {
                var latestPrevEventStatusComp = JSON.stringify({
                    score: latestPrevEventStatus.score,
                    status: latestPrevEventStatus.status,
                    matchStatus: latestPrevEventStatus.matchStatus   
                });
            } catch(error) {
                    var latestPrevEventStatusComp = "";
            }

            try {
                var currentEventStatusComp = JSON.stringify({
                    score: currentStatuses[i].state.score,
                    status: currentStatuses[i].state.status,
                    matchStatus: currentStatuses[i].state.matchStatus   
                });
            } catch(error) {
                var currentEventStatusComp = "";
            }

            if (latestPrevEventStatusComp !== currentEventStatusComp && currentStatuses[i].state != null) {

                // add marketId
                var state = currentStatuses[i].state;
                state.marketId = currentStatuses[i].marketId;
                prevStatuses.push(state); 
                
                // save status
                logMarketBet(currentStatuses[i].marketId, currentStatuses[i].state, domainMrGold, true)
            } else {
                // unsaved because there is no changes
            }
        
        // LOG NEW GAMES -----------------------------
        } else {
            if (currentStatuses[i].state) {
                prevEventIds.push(currentStatuses[i].eventId);

                if (currentStatuses[i].state != null) {   
                    var state = currentStatuses[i].state;
                    state.marketId = currentStatuses[i].marketId;
                    prevStatuses.push(state); 
                }
    
                // save new LogGame (private function)
                saveNewGame(currentStatuses[i]);
            
                // call and save logStatus 
                logMarketBet(currentStatuses[i].marketId, currentStatuses[i].state, domainMrGold, true)

            } else if (currentStatuses[i].eventId && currentStatuses[i].marketId) {

                prevEventIds.push(currentStatuses[i].eventId);
                prevStatuses.push({
                    eventId: currentStatuses[i].eventId, 
                    marketId: currentStatuses[i].marketId
                });    

            } else {
                // do nothing
            }
        }

    // loop current statuses
    }

    // make sure prevStatuses and prevEventIds left clean
    // console.log(currentEventIds)    
    // console.log("current = prevEventIds = prevDedupedStatuses < prevStatuses")
    // console.log(
    //     currentEventIds.length + " = " +
    //     prevEventIds.length + " = " +
    //     Array.from(new Set(prevStatuses.map(i => i.eventId))).length + " < " +
    //     prevStatuses.length 
    // )
    // console.log();
} 

module.exports = { 
    //logSoccerEvents: logSoccerEvents,
    logSoccerGames: logSoccerGames 
}
