var unirest = require('unirest');
var conf = require("../config/config");
var betting = require("./soccerBettingController");
var bet = require("../models/Bet");
var vishnu = require("../models/Vishnu");

var placedBets = [];
const placeAndWriteBet = conf.app.placeAndWriteBet;
const writeEvents = conf.app.writeEvents;
const logEvents = conf.logging.events;


function catchSoccerEvents(gamesInPlayResponse, domainVishnu, domainMrGold, times) {
    
    // retrieve all event Ids passed from main controller
    var eventIds = "";
    for(var i in gamesInPlayResponse.body) {
        eventIds = eventIds + gamesInPlayResponse.body[i].id + ",";
    }
    
    // log
    if (logEvents) { console.log("Iteration: " + times +". Soccer controller. In-play socer events ids: " + eventIds) }

    // retrieve Vishnu eventTimelines
    unirest.get(domainVishnu + '/api/listEventStatus/' + eventIds)
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .end(function (eventTimelinesResponse) {

           // log
           if (logEvents) { console.log("Iteration: " + times + ". Soccer controller. Retrieved from Vishnu all event timelines"); }

            // if Vishnu response is JSON 
           if (eventTimelinesResponse.headers['content-type'] == 'application/json') {

                // log
                if (logEvents) { console.log("Iteration: " + times + ". Soccer controller. Vishnu response is JSON"); }

                var vishnuEventTimeline = eventTimelinesResponse.body;

                // to clean up placed bets
                var prevEventIds = [];

                // log
                if (logEvents) { console.log("Iteration: " + times
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
                            if (logEvents) { console.log("Iteration: " + times
                            + ". Soccer controller. Event id " + vishnuEventTimeline[i].eventId + " had undefined field(s) in VISHNU response"); }
                    }

                    var conditions = { eventId: vishnuEventTimeline[i].eventId }

                    // write game statusses from Vishnu in DB
                    if (writeEvents) {
                        vishnu.dataset.findOneAndUpdate(conditions, vishnuEventTimeline[i], {upsert: true}, function(err) {
                            if (err) {
                                console.log("ERROR writing Vishnu to game log DB: " + err);                        
                            throw err;
                            } 
                        });
                    }

                    // if compleate, write game results for all its bets
                    if  (vishnuEventTimeline[i].status == "COMPLETE") {
                        if (writeEvents) {
                            bet.dataset.updateMany(conditions, {gameStatus: vishnuEventTimeline[i].status, score: vishnuEventTimeline[i].score}, {upsert: false}, function(err) {
                                if (err) {
                                    console.log("ERROR writing Vishnu to bet log DB: " + err);                        
                                throw err;
                                } 
                            });
                        }
                    }

                    // if so, run
                    if (run) {
                        // not already bet 
                        if (!placedBets.includes(vishnuEventTimeline[i].eventId)) {
                            // elapsed time
                            if (vishnuEventTimeline[i].timeElapsed >= conf.soccer.elapsedTime) {

                               //log
                               if (logEvents) { console.log("Iteration: " + times
                               + ". Soccer controller. Elapsed time " + vishnuEventTimeline[i].timeElapsed 
                               + " for " + vishnuEventTimeline[i].eventId
                               + " is right to place a bet"); }

                                // 1. home team vining
                                if (vishnuEventTimeline[i].score.home.score - vishnuEventTimeline[i].score.away.score >= conf.soccer.scoreHigher) {
                                    // to avoid double betting
                                    placedBets.push(vishnuEventTimeline[i].eventId);

                                    // place bet if conf
                                    if (placeAndWriteBet) {

                                       betting.placeBet(domainMrGold, vishnuEventTimeline[i].eventId, vishnuEventTimeline[i].score.home.name, vishnuEventTimeline[i].timeElapsed);
                                       
                                       //log
                                       if (logEvents) { console.log("Iteration: " + times
                                        + ". Soccer controller. Bet placed for " + vishnuEventTimeline[i].eventId
                                        + " HOME team"); }
                                    }
                                }

                                // 2. away team vining
                                else if (vishnuEventTimeline[i].score.away.score - vishnuEventTimeline[i].score.home.score >= conf.soccer.scoreHigher) {
                                    // to avoid double betting
                                    placedBets.push(vishnuEventTimeline[i].eventId);
                                    
                                    // place bet
                                    if (placeAndWriteBet) {

                                        betting.placeBet(domainMrGold, vishnuEventTimeline[i].eventId, vishnuEventTimeline[i].score.away.name, vishnuEventTimeline[i].timeElapsed);
                                        
                                        //log
                                        if (logEvents) { console.log("Iteration: " + times
                                         + ". Soccer controller. Bet placed for " + vishnuEventTimeline[i].eventId
                                         + " AWAY team"); }                                        
                                    }
                                }

                            }
                        } else { 
                            // log
                            if (logEvents) { console.log("Iteration: " + times
                            + ". Soccer controller. Event id " + vishnuEventTimeline[i].eventId + " has bet already placed"); }
                        }
                    }
                }

                //log
                if (logEvents) { console.log("Iteration: " + times
                 + ". Soccer controller. Bets placed  before cleaning: " + placedBets); }

                // to clean up placed bets
                for(var b in placedBets) {
                    if (!prevEventIds.includes(placedBets[b])) {
                        
                        // remove eventIds from "not double bet" array (IF SAVE WILL NOT WORK RESULTS ARE LOST...)
                        var finishedItem = placedBets[b];
                        placedBets = placedBets.filter(item => item !== finishedItem);

                    }                            
                }

                //log
                if (logEvents) { console.log("Iteration: " + times
                + ". Soccer controller. Bets placed  after cleaning: " + placedBets); }
            }
        })
        .on('error', function(e) {
            console.log("Error recieving /api/listEventStatus from Vishnu API: " + e.message);
        });
}

module.exports = { catchSoccerEvents: catchSoccerEvents }
