var unirest = require('unirest');
var conf = require("../config/config");
var betting = require("./soccerBettingController");
var Action = require("../models/Action").dataset
var soccerLoggs = require("./soccerLoggController");

var placedBets = [];

function catchSoccerEvents(gamesInPlayResponse, domainVishnu, domainMrGold) {
    
    // retrieve all event Ids
    var eventIds = "";
    for(var i in gamesInPlayResponse.body) {
        eventIds = eventIds + gamesInPlayResponse.body[i].id + ",";
    }

    // retrieve game statuses
    unirest.get(domainVishnu + '/api/listEventStatus/' + eventIds)
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .end(function (gamesStatusResponse) {
           
            // if Vishnu response is JSON 
           if (gamesStatusResponse.headers['content-type'] == 'application/json') {
            
                var games = gamesStatusResponse.body;

                // LOG GAMES ---------------------------------- >
                soccerLoggs.logSoccerGames(games, domainMrGold);
                // -------------------------------------------- >

                // to clean up placed bets
                var prevEventIds = [];

                // go trough Vishnu array
                for(var i in games) {

                    // to clean up placed bets
                    prevEventIds.push(games[i].eventId);                      

                    // is all data available
                    var run = false;
                    if (
                        typeof games[i].eventId !== 'undefined' &&
                        typeof games[i].marketId !== 'undefined' && 
                        typeof games[i].eventName !== 'undefined' && 
                        typeof games[i].homeName !== 'undefined' && 
                        typeof games[i].awayName !== 'undefined' && 
                        typeof games[i].state !== 'undefined' && 
                        typeof games[i].state.score.home.score !== 'undefined' && 
                        typeof games[i].state.score.away.score !== 'undefined' && 
                        typeof games[i].state.timeElapsed !== 'undefined'
                    ) { run = true }

                    // if so, run
                    if (run) {
                        // not already bet 
                        if (!placedBets.includes(games[i].eventId)) {
                            // elapsed time
                            if (games[i].state.timeElapsed >= conf.soccer.elapsedTime) {
                                // score high
                                // 1. home team vining
                                if (games[i].state.score.home.score - games[i].state.score.away.score >= conf.soccer.scoreHigher) {
                                    // to avoid double betting
                                    placedBets.push(games[i].eventId);

                                    // place bet
                                    if (conf.app.live) {
                                        betting.placeBet(domainMrGold, games[i].eventId, games[i].marketId, games[i].homeName, games[i].state.timeElapsed);
                                    }

                                }
                                // 2. away team vining
                                else if (games[i].state.score.away.score - games[i].state.score.home.score >= conf.soccer.scoreHigher) {
                                    // to avoid double betting
                                    placedBets.push(games[i].eventId);
                                    
                                    // place bet
                                    if (conf.app.live) {
                                        betting.placeBet(domainMrGold, games[i].eventId, games[i].marketId, games[i].awayName, games[i].state.timeElapsed);
                                    }
                                }
                            }
                        }
                    }
                }

                // TO CLEAN UP PLACED BETS AND WRITE RESULTS
                //////////////////////////////////////////////////////
                for(var b in placedBets) {
                    if (!prevEventIds.includes(placedBets[b])) {
                        
                        // remove eventIds from "not double bet" array (IF SAVE WILL NOT WORK RESULTS ARE LOST...)
                        var finishedItem = placedBets[b];
                        placedBets = placedBets.filter(item => item !== finishedItem);

                        // retrieve from db by using placedBets array value
                        Action.findOne({"eventId": finishedItem}, "marketId results", function (err, action) {
                            if (err) console.log("Error retrieve Action from DB to write result: " + err);

                            if (action) {
                                unirest.get(domainMrGold + '/api/listMarketBet/'+action.marketId)
                                    .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
                                    .end(function (listMarketBetResponse) {

                                        // checks for response from listMarketBet
                                        if (listMarketBetResponse.body[0] !== 'undefined') {
                                            if (listMarketBetResponse.body[0].item !== 'undefined') {
                                                if (listMarketBetResponse.body[0].item.runners !== 'undefined') {
                                                    if (listMarketBetResponse.body[0].item.runners) {
                                                        
                                                        var runners = listMarketBetResponse.body[0].item.runners;
                                                        
                                                        // loop trough 3 result variants
                                                        for (var i in runners){
                                                            if (runners[i].status == "WINNER") {

                                                                // update db field
                                                                action.results = "WINNER: " + runners[i].selectionId;
                                                            
                                                                // write to DB
                                                                action.save(function(err) {
                                                                    if (err) {
                                                                        console.log("ERROR writing update ACTION to DB");                        
                                                                    } 
                                                                });
                                                            // if vinner
                                                            }
                                                        // loop
                                                        }
                                                    // checks                                                   
                                                    }
                                                }
                                            }
                                        }
                                    // unirest
                                    });
                            // if action defind
                            }
                        })
                    }                            
                }
            }
        // if Vishnu response is JSON
        })
        .on('error', function(e) {
            console.log("Error recieving /api/listEventStatus from Vishnu API: " + e.message);
        });
}

module.exports = { catchSoccerEvents: catchSoccerEvents }
