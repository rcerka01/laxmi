var unirest = require('unirest');
var conf = require("../config/config");
var betting = require("./soccerBettingController");
var Action = require("../models/Action").dataset
var soccerLoggs = require("./soccerLoggController");

var placedBets = [];
const live = conf.app.live;
const log = conf.app.log;

function catchSoccerEvents(gamesInPlayResponse, domainVishnu, domainMrGold, times) {
    
    // retrieve all event Ids passed from main controller
    var eventIds = "";
    for(var i in gamesInPlayResponse.body) {
        eventIds = eventIds + gamesInPlayResponse.body[i].id + ",";
    }
    
    // log
    if (log) { console.log("Iteration: " + times +". Soccer controller. In-play socer events ids: " + eventIds) }

    // retrieve Vishnu eventTimelines
    unirest.get(domainVishnu + '/api/listEventStatus/' + eventIds)
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .end(function (eventTimelinesResponse) {

           // log
           if (log) { console.log("Iteration: " + times + ". Soccer controller. Retrieved from Vishnu all event timelines"); }

            // if Vishnu response is JSON 
           if (eventTimelinesResponse.headers['content-type'] == 'application/json') {

                // log
                if (log) { console.log("Iteration: " + times + ". Soccer controller. Vishnu response is JSON"); }

                var vishnuEventTimeline = eventTimelinesResponse.body;

                // LOG GAMES ---------------------------------- >
                //soccerLoggs.logSoccerGames(games, domainMrGold);
                // -------------------------------------------- >

                // to clean up placed bets
                var prevEventIds = [];

                // log
                if (log) { console.log("Iteration: " + times
                 + ". Soccer controller. Event ids loaded from VISHNU (must mutch with retrieved from MR GOLD): "
                 + vishnuEventTimeline.map(event => event.eventId)); }

                // go trough Vishnu array
                for(var i in vishnuEventTimeline) {

                    // to clean up placed bets
                    prevEventIds.push(vishnuEventTimeline[i].eventId);                      

                    // is all data available
                    var run = false;
                    if (
                        typeof vishnuEventTimeline[i].eventId !== 'undefined' &&
                        typeof vishnuEventTimeline[i].score.home.name !== 'undefined' &&
                        typeof vishnuEventTimeline[i].score.away.name !== 'undefined' &&
                        typeof vishnuEventTimeline[i].score.home.score !== 'undefined' &&
                        typeof vishnuEventTimeline[i].score.away.score !== 'undefined' &&
                        typeof vishnuEventTimeline[i].timeElapsed !== 'undefined' &&
                        typeof vishnuEventTimeline[i].status !== 'undefined'
                    ) { run = true }
                    else { 
                            // log
                            if (log) { console.log("Iteration: " + times
                            + ". Soccer controller. Event id " + vishnuEventTimeline[i].eventId + " had undefined field(s) in VISHNU response"); }
                    }

                    // if so, run
                    if (run) {
                        // not already bet 
                        if (!placedBets.includes(vishnuEventTimeline[i].eventId)) {
                            // elapsed time
                            if (vishnuEventTimeline[i].timeElapsed >= conf.soccer.elapsedTime) {

                               //log
                               if (log) { console.log("Iteration: " + times
                               + ". Soccer controller. Elapsed time " + vishnuEventTimeline[i].timeElapsed 
                               + " for " + vishnuEventTimeline[i].eventId
                               + " is right to place a bet"); }

                                // 1. home team vining
                                if (vishnuEventTimeline[i].score.home.score - vishnuEventTimeline[i].score.away.score >= conf.soccer.scoreHigher) {
                                    // to avoid double betting
                                    placedBets.push(vishnuEventTimeline[i].eventId);

                                    // place bet if live env
                                    if (live) {

                                       betting.placeBet(domainMrGold, vishnuEventTimeline[i].eventId, vishnuEventTimeline[i].score.home.name );
                                       
                                       //log
                                       if (log) { console.log("Iteration: " + times
                                        + ". Soccer controller. Bet placed for " + vishnuEventTimeline[i].eventId
                                        + " HOME team"); }
                                    }
                                }

                                // 2. away team vining
                                else if (vishnuEventTimeline[i].score.away.score - vishnuEventTimeline[i].score.home.score >= conf.soccer.scoreHigher) {
                                    // to avoid double betting
                                    placedBets.push(vishnuEventTimeline[i].eventId);
                                    
                                    // place bet
                                    if (conf.app.live) {

                                        betting.placeBet(domainMrGold, vishnuEventTimeline[i].eventId, vishnuEventTimeline[i].score.away.name);
                                        
                                        //log
                                        if (log) { console.log("Iteration: " + times
                                         + ". Soccer controller. Bet placed for " + vishnuEventTimeline[i].eventId
                                         + " AWAY team"); }                                        
                                    }
                                }

                            }
                        } else { 
                            // log
                            if (log) { console.log("Iteration: " + times
                            + ". Soccer controller. Event id " + vishnuEventTimeline[i].eventId + " has bet already placed"); }
                        }
                    }
                }

                //log
                if (log) { console.log("Iteration: " + times
                 + ". Soccer controller. Bets placed  before cleaning: " + placedBets); }

                // to clean up placed bets
                for(var b in placedBets) {
                    if (!prevEventIds.includes(placedBets[b])) {
                        
                        // remove eventIds from "not double bet" array (IF SAVE WILL NOT WORK RESULTS ARE LOST...)
                        var finishedItem = placedBets[b];
                        placedBets = placedBets.filter(item => item !== finishedItem);

                        // retrieve from db by using placedBets array value
                        // Action.findOne({"eventId": finishedItem}, "marketId results", function (err, action) {
                        //     if (err) console.log("Error retrieve Action from DB to write result: " + err);

                        //     if (action) {
                        //         unirest.get(domainMrGold + '/api/listMarketBet/'+action.marketId)
                        //             .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
                        //             .end(function (listMarketBetResponse) {

                        //                 // checks for response from listMarketBet
                        //                 if (listMarketBetResponse.body[0] !== 'undefined') {
                        //                     if (listMarketBetResponse.body[0].item !== 'undefined') {
                        //                         if (listMarketBetResponse.body[0].item.runners !== 'undefined') {
                        //                             if (listMarketBetResponse.body[0].item.runners) {
                                                        
                        //                                 var runners = listMarketBetResponse.body[0].item.runners;
                                                        
                        //                                 // loop trough 3 result variants
                        //                                 for (var i in runners){
                        //                                     if (runners[i].status == "WINNER") {

                        //                                         // update db field
                        //                                         action.results = "WINNER: " + runners[i].selectionId;
                                                            
                        //                                         // write to DB
                        //                                         action.save(function(err) {
                        //                                             if (err) {
                        //                                                 console.log("ERROR writing update ACTION to DB");                        
                        //                                             } 
                        //                                         });
                        //                                     // if vinner
                        //                                     }
                        //                                 // loop
                        //                                 }
                        //                             // checks                                                   
                        //                             }
                        //                         }
                        //                     }
                        //                 }
                        //             // unirest
                        //             });
                        //     // if action defind
                        //     }
                        // })
                    }                            
                }

                //log
                if (log) { console.log("Iteration: " + times
                + ". Soccer controller. Bets placed  after cleaning: " + placedBets); }
            }
        })
        .on('error', function(e) {
            console.log("Error recieving /api/listEventStatus from Vishnu API: " + e.message);
        });
}

module.exports = { catchSoccerEvents: catchSoccerEvents }
