// var unirest = require('unirest');
// var conf = require("../config/config");

// // PRIVATE FUNCTIONS ####################################################################################

// function saveSingleMarketLog(marketId, eventId, domainMrGold) {

//     unirest.get(domainMrGold + '/api/listMarketBet/' + marketId)
//     .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
//     .end(function (marketBetResponse) {

//         // add marketId and eventId
//         var marketBet = marketBetResponse.body;
//         var finishedMarketBet = {
//             market:marketBet[0],
//             marketId: marketId,
//             eventId: eventId
//         }

//         // save if unique
//         var LogMarkets = require("../models/LogMarket");
//         LogMarkets.dataset.count({"logMarket.eventId": eventId}, function (err, count){ 
//             if (count > 0) {
//                 // market already exist
//             } else {
//                 var LogMarket = require("../models/LogMarket").newDataset(finishedMarketBet);
//                 LogMarket.save(function(err, saveResp) {
//                     if (err) {
//                         console.log("ERROR writing LogMarket to DB: " + err);                        
//                     } 
//                     // console.log("MARKET SAVED: " + saveResp.logMarket.eventId)
//                 });
//             }
//         });

//     })
//     .on('error', function(e) {
//         console.log("CANNOT GET SINGLE MARKET BET LOGS: " + e);
//     });
// }

// // ####################################################################################

// function saveNewGame(status) {
//     // check if game not already exist
//     var LogGames = require("../models/LogGame");
//     LogGames.dataset.count({"logGame.eventId": status.eventId}, function (err, count){ 
//         if (count > 0) {
//             // game already exist
//         } else {
//             // save new LogGame
//             var LogGame = require("../models/LogGame").newDataset(status);
//             LogGame.save(function(err, saveResp) {
//                 if (err) {
//                     console.log("ERROR writing LogGame to DB: " + err);                        
//                 } 
                
//                 console.log("GAME SAVED: " + saveResp.logGame.eventId)
//             });
//         }
//     }); 
// }

// // ####################################################################################

// function logMarketBet(marketId, gameStatus, domainMrGold, isStatusLog) {
    
//     unirest.get(domainMrGold + '/api/listMarketBet/' + marketId)
//     .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
//     .end(function (marketBetResponse) {

//         var marketBet = marketBetResponse.body;

//         // is Status Log
//         if (isStatusLog) {

//             try { var zeroSelId = marketBet[0].item.runners[0].selectionId } catch(e) { var zeroSelId = "unknown" }
//             try { var zeroStat = marketBet[0].item.runners[0].status } catch(e) { var zeroStat = "unknown" }
//             try { var zeroBackPrice = marketBet[0].item.runners[0].ex.availableToBack[0].price } catch(e) { var zeroBackPrice ="unknown" }
//             try { var zeroBackSize = marketBet[0].item.runners[0].ex.availableToBack[0].size } catch(e) { var zeroBackSize = "unknown" }
//             try { var zeroLayPrice = marketBet[0].item.runners[0].ex.availableToLay[0].price } catch(e) { var zeroLayPrice = "unknown" }
//             try { var zeroLaySize = marketBet[0].item.runners[0].ex.availableToLay[0].size  } catch(e) { var zeroLaySize = "unknown" }  
            
//             try { var oneSelId = marketBet[0].item.runners[1].selectionId } catch(e) { var oneSelId = "unknown" }
//             try { var oneStat = marketBet[0].item.runners[1].status } catch(e) { var oneStat = "unknown" }
//             try { var oneBackPrice = marketBet[0].item.runners[1].ex.availableToBack[0].price } catch(e) { var oneBackPrice = "unknown" }
//             try { var oneBackSize = marketBet[0].item.runners[1].ex.availableToBack[0].size } catch(e) { var oneBackSize = "unknown" }
//             try { var oneLayPrice = marketBet[0].item.runners[1].ex.availableToLay[0].price } catch(e) { var oneLayPrice = "unknown" }
//             try { var oneLaySize = marketBet[0].item.runners[1].ex.availableToLay[0].size  } catch(e) { var oneLaySize = "unknown" }

//             try { var twoSelId = marketBet[0].item.runners[2].selectionId } catch(e) { var twoSelId = "unknown" }
//             try { var twoStat = marketBet[0].item.runners[2].status } catch(e) { var twoStat = "unknown" }
//             try { var twoBackPrice = marketBet[0].item.runners[2].ex.availableToBack[0].price } catch(e) { var twoBackPrice = "unknown" }
//             try { var twoBackSize = marketBet[0].item.runners[2].ex.availableToBack[0].size } catch(e) { var twoBackSize = "unknown" }
//             try { var twoLayPrice = marketBet[0].item.runners[2].ex.availableToLay[0].price } catch(e) { var twoLayPrice = "unknown" }
//             try { var twoLaySize = marketBet[0].item.runners[2].ex.availableToLay[0].size  } catch(e) { var twoLaySize = "unknown" }

//             var marketBetLog = [
//                 (zeroSelId != 'unknown' ?
//                     {
//                         selectionId: zeroSelId,
//                         status: (zeroStat != 'unknown' ? zeroStat : undefined),
//                         backPrice: (zeroBackPrice != 'unknown' ? zeroBackPrice : undefined),
//                         backSize: (zeroBackSize != 'unknown' ? zeroBackSize : undefined),
//                         layPrice: (zeroLayPrice != 'unknown' ? zeroLayPrice : undefined),
//                         laySize: (zeroLaySize != 'unknown' ? zeroLaySize : undefined),
//                     } : undefined),
//                 (oneSelId != 'unknown' ?
//                     {
//                         selectionId: oneSelId,
//                         status: (oneStat != 'unknown' ? oneStat : undefined),
//                         backPrice: (oneBackPrice != 'unknown' ? oneBackPrice : undefined),
//                         backSize: (oneBackSize != 'unknown' ? oneBackSize : undefined),
//                         layPrice: (oneLayPrice != 'unknown' ? oneLayPrice : undefined),
//                         laySize: (oneLaySize != 'unknown' ? oneLaySize : undefined),
//                     } : undefined),
//                 (twoSelId != 'unknown' ?
//                     {
//                         selectionId: twoSelId,
//                         status: (twoStat != 'unknown' ? twoStat : undefined),
//                         backPrice: (twoBackPrice != 'unknown' ? twoBackPrice : undefined),
//                         backSize: (twoBackSize != 'unknown' ? twoBackSize : undefined),
//                         layPrice: (twoLayPrice != 'unknown' ? twoLayPrice : undefined),
//                         laySize: (twoLaySize != 'unknown' ? twoLaySize : undefined),
//                     } : undefined),
//             ];

//             var status = {
//                 gameStatus: gameStatus,
//                 marketBetStatus: marketBetLog
//             }

//             // save new LogStatus
//             var LogStatus = require("../models/LogStatus").newDataset(status);
//             LogStatus.save(function(err) {
//                 if (err) {
//                     console.log("ERROR writing LogStatus to DB: " + err);                        
//                 } 
//             });

//         // if Result Log
//         } else {
//             // check if game is closed to save result
//             if (marketBet[0].item.status == "CLOSED") {
//                 marketBet[0].eventId = gameStatus.eventId;

//                 // save new LogResult
//                 var LogResult = require("../models/LogResult").newDataset(marketBet);
//                 LogResult.save(function(err) {
//                     if (err) {
//                         console.log("ERROR writing LogResult to DB: " + err);                        
//                     } 
//                 });
//             }
//         }
//     })
//     .on('error', function(e) {
//         // save new LogStatus withot marketBetLogcurrentStatuses[i].eventId
//         var LogStatus = require("../models/LogStatus").newDataset(gameStatus);
//         LogStatus.save(function(err) {
//             if (err) {
//                 console.log("ERROR writing LogStatus to DB (without marketBetLog): " + err);                        
//             } 
//         });
//         console.log("CANNOT GET MARKET BET LOGS");
//     });
// }

// // ####################################################################################

// var prevEventIds = [];
// var prevStatuses = [];

// function logSoccerGames(currentStatuses, domainMrGold) {
//     // get inPlay game ids
//     try {
//         var currentEventIds = currentStatuses.map(currentStatus => currentStatus.eventId);
//     } catch(error) {
//         var currentEventIds = [];
//     }

//     console.log(" log started ");
//     console.log(currentEventIds);

//      // CLEAN OLD GAMES ----------------------------

//      for (var i in prevEventIds) {
//         if (!currentEventIds.includes(prevEventIds[i])) {
           
//             // try { var resultMarketId = prevStatuses.filter(item => item.eventId == prevEventIds[i])[0].marketId; }
//             // catch (e) {resultMarketId = "undefined";}
//             // // call and save LogResults
//             // if (resultMarketId != "undefined") { 
//             //     logMarketBet(resultMarketId, {eventId: prevEventIds[i]}, domainMrGold, false) 
//             // }

//             prevStatuses = prevStatuses.filter(item => item.eventId != prevEventIds[i])
//             prevEventIds = prevEventIds.filter(item => item != prevEventIds[i])
//         }
//     }

//     // --------------------------------------------------------------------------------------------- >



//     // loop current statuses (main loop)
//     for (var i in currentStatuses) {

//         // LOG SINGLE MARKET AT THE END ----------------------------
//         // will start on 88 minute ^^^
//         // state field not exist
//         //try { var gameTime = currentStatuses[i].state.timeElapsed } catch(e) { var gameTime = 0 }
//         try { var gameTime = currentStatuses[i].timeElapsed } catch(e) { var gameTime = 0 }

//         console.log("from Vishnu elapsed time: " + gameTime);
        
//         if (gameTime >= conf.soccer.timeCollectMarketLog) {

//             // ***
//             console.log("save 1 " + currentStatuses[i].eventId)

//             // this will not work
//             // market Id must be found
//             var tempMarketId = 00000;
//             //saveSingleMarketLog(currentStatuses[i].marketId, currentStatuses[i].eventId, domainMrGold)
//             console.log("Save single market log at 88 min,happening with temp market id for: " + currentStatuses[i].eventId)
//             saveSingleMarketLog(tempMarketId, currentStatuses[i].eventId, domainMrGold)
//         }

//         // ---------------------------------------------------------


        
//         // LOG EXISTING GAMES -----------------------------
//         if (prevEventIds.includes(currentStatuses[i].eventId)) {

//             var latestPrevEventStatus = prevStatuses
//                                             .filter(item => item.eventId == currentStatuses[i].eventId)
//                                             .pop();

//             try {
//                 var latestPrevEventStatusComp = JSON.stringify({
//                     score: latestPrevEventStatus.score,
//                     status: latestPrevEventStatus.status,
//                     matchStatus: latestPrevEventStatus.matchStatus   
//                 });
//             } catch(error) {
//                     var latestPrevEventStatusComp = "";
//             }

//                     // score: currentStatuses[i].state.score,
//                     // status: currentStatuses[i].state.status,
//                     // matchStatus: currentStatuses[i].state.matchStatus

//             try {
//                 var currentEventStatusComp = JSON.stringify({
//                     score: currentStatuses[i].score,
//                     status: currentStatuses[i].status,
//                     matchStatus: currentStatuses[i].matchStatus   
//                 });
//             } catch(error) {
//                 var currentEventStatusComp = "";
//             }

//             // // state not exist
//             // if (latestPrevEventStatusComp !== currentEventStatusComp && currentStatuses[i].state != null) {

//             //     // add marketId
//             //     var state = currentStatuses[i].state;
//             //     state.marketId = currentStatuses[i].marketId;
//             //     prevStatuses.push(state); 
                
//             //     // save status
//             //     logMarketBet(currentStatuses[i].marketId, currentStatuses[i].state, domainMrGold, true)
//             // } else {
//             //     // unsaved because there is no changes
//             // }
        
//         // LOG NEW GAMES -----------------------------
//         } else {
//             // if (currentStatuses[i].state) {
//             if (currentStatuses[i].timeElapsed > 0) {
//                     prevEventIds.push(currentStatuses[i].eventId);

//                 // if (currentStatuses[i].state != null) {   
//                 //     var state = currentStatuses[i].state;
//                 //     state.marketId = currentStatuses[i].marketId;
//                 //     prevStatuses.push(state); 
//                 // }
    
//                 // save new LogGame (private function)
//                 console.log("saving NEW GAME: " + currentStatuses[i])
//                 saveNewGame(currentStatuses[i]);
            
//                 // call and save logStatus 
//                 // suspended. need marketId
//                 //logMarketBet(currentStatuses[i].marketId, currentStatuses[i].state, domainMrGold, true)

//          //   } else if (currentStatuses[i].eventId && currentStatuses[i].marketId) {
//             } else if (currentStatuses[i].eventId) {

//                 prevEventIds.push(currentStatuses[i].eventId);
//                 // prevStatuses.push({
//                 //     eventId: currentStatuses[i].eventId, 
//                 //     marketId: currentStatuses[i].marketId
//                 // });    

//             } else {
//                 // do nothing
//             }
//         }
//     }
// }




















// function logSoccerGames2(currentStatuses, domainMrGold) {

//     // get inPlay game ids
//     try {
//         var currentEventIds = currentStatuses.map(currentStatus => currentStatus.eventId);
//     } catch(error) {
//         var currentEventIds = [];
//     }

//     console.log(" log started ");
//     console.log(currentEventIds);
    
//     // CLEAN OLD GAMES ----------------------------

//     for (var i in prevEventIds) {
//         if (!currentEventIds.includes(prevEventIds[i])) {
           
//             try { var resultMarketId = prevStatuses.filter(item => item.eventId == prevEventIds[i])[0].marketId; }
//             catch (e) {resultMarketId = "undefined";}
//             // call and save LogResults
//             if (resultMarketId != "undefined") { 
//                 logMarketBet(resultMarketId, {eventId: prevEventIds[i]}, domainMrGold, false) 
//             }

//             prevStatuses = prevStatuses.filter(item => item.eventId != prevEventIds[i])
//             prevEventIds = prevEventIds.filter(item => item != prevEventIds[i])
//         }
//     }

//     // --------------------------------------------------------------------------------------------- >

//     // loop current statuses (main loop)
//     for (var i in currentStatuses) {

//         // LOG SINGLE MARKET AT THE END ----------------------------
//         // will start on 88 minute ^^^

//         //try { var gameTime = currentStatuses[i].state.timeElapsed } catch(e) { var gameTime = 0 }
//         try { var gameTime = currentStatuses[i].timeElapsed } catch(e) { var gameTime = 0 }

//         console.log("from Vishnu " + gameTime);
        
//         if (gameTime >= conf.soccer.timeCollectMarketLog) {

//             // ***
//             console.log("save 1 " + currentStatuses[i].eventId)

//             // this will not work because no marketId in Vishnu. MEABY???
//             saveSingleMarketLog(currentStatuses[i].marketId, currentStatuses[i].eventId, domainMrGold)
//         }

//         // ---------------------------------------------------------
        
//         // LOG EXISTING GAMES -----------------------------
//         if (prevEventIds.includes(currentStatuses[i].eventId)) {

//             var latestPrevEventStatus = prevStatuses
//                                             .filter(item => item.eventId == currentStatuses[i].eventId)
//                                             .pop();

//             try {
//                 var latestPrevEventStatusComp = JSON.stringify({
//                     score: latestPrevEventStatus.score,
//                     status: latestPrevEventStatus.status,
//                     matchStatus: latestPrevEventStatus.matchStatus   
//                 });
//             } catch(error) {
//                     var latestPrevEventStatusComp = "";
//             }

//                     // score: currentStatuses[i].state.score,
//                     // status: currentStatuses[i].state.status,
//                     // matchStatus: currentStatuses[i].state.matchStatus

//             try {
//                 var currentEventStatusComp = JSON.stringify({
//                     score: currentStatuses[i].score,
//                     status: currentStatuses[i].status,
//                     matchStatus: currentStatuses[i].matchStatus   
//                 });
//             } catch(error) {
//                 var currentEventStatusComp = "";
//             }

//             // state not exist
//             if (latestPrevEventStatusComp !== currentEventStatusComp && currentStatuses[i].state != null) {

//                 // add marketId
//                 var state = currentStatuses[i].state;
//                 state.marketId = currentStatuses[i].marketId;
//                 prevStatuses.push(state); 
                
//                 // save status
//                 logMarketBet(currentStatuses[i].marketId, currentStatuses[i].state, domainMrGold, true)
//             } else {
//                 // unsaved because there is no changes
//             }
        
//         // LOG NEW GAMES -----------------------------
//         } else {
//             // if (currentStatuses[i].state) {
//             if (currentStatuses[i].timeElapsed > 0) {
//                     prevEventIds.push(currentStatuses[i].eventId);

//                 if (currentStatuses[i].state != null) {   
//                     var state = currentStatuses[i].state;
//                     state.marketId = currentStatuses[i].marketId;
//                     prevStatuses.push(state); 
//                 }
    
//                 // save new LogGame (private function)
                
// // ***
// console.log("save 2 " + currentStatuses[i])

//                 saveNewGame(currentStatuses[i]);
            
//                 // call and save logStatus 
//                 logMarketBet(currentStatuses[i].marketId, currentStatuses[i].state, domainMrGold, true)

//             } else if (currentStatuses[i].eventId && currentStatuses[i].marketId) {

//                 prevEventIds.push(currentStatuses[i].eventId);
//                 prevStatuses.push({
//                     eventId: currentStatuses[i].eventId, 
//                     marketId: currentStatuses[i].marketId
//                 });    

//             } else {
//                 // do nothing
//             }
//         }
//     }
// } 

// module.exports = { 
//     //logSoccerEvents: logSoccerEvents,
//     logSoccerGames: logSoccerGames 
// }
