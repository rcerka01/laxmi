var unirest = require('unirest');
var conf = require("../config/config");
var betting = require("./soccerBettingController");

var placedBets = [];

function catchSoccerEvents(gamesInPlayResponse, domainVishnu, domainMrGreen) {
    
    // retrieve all event Ids
    var eventIds = "";
    for(var i in gamesInPlayResponse.body) {
        eventIds = eventIds + gamesInPlayResponse.body[i].id + ",";
    }

    // retrieve game statuses
    unirest.get(domainVishnu + '/api/listEventStatus/' + eventIds)
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .end(function (gamesStatusResponse) {

            var games = gamesStatusResponse.body;

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
                            // 1. home team wining
                            if (games[i].state.score.home.score - games[i].state.score.away.score >= conf.soccer.scoreHigher) {
                                placedBets.push(games[i].eventId);
                                betting.placeBet(domainMrGreen, games[i].eventId, games[i].marketId, games[i].homeName);
                            }
                            // 2. away team vining
                            //else if (games[i].state.score.away.score - games[i].state.score.home.score >= conf.soccer.scoreHigher) {
                                placedBets.push(games[i].eventId);
                                betting.placeBet(domainMrGreen, games[i].eventId, games[i].marketId, games[i].awayName);
                           // }
                        }
                    }
                }
            }

            // to clean up placed bets
            for(var b in placedBets) {
                if (!prevEventIds.includes(placedBets[b]))
                    placedBets = placedBets.filter(item => item !== placedBets[b])                                
            }

        })
        .on('error', function(e) {
            console.log("Error rerieving /api/listEventStatus from Vishnu API: " + e.message);
        });
}

module.exports = { catchSoccerEvents: catchSoccerEvents }
