var schedule = require('node-schedule');
var unirest = require('unirest');
var conf = require("../config/config");
var soccerEvents = require("./soccerEventController");
var loggs = require("./soccerLoggController");
var soccerOdds = require("./soccerOddsController");

const domainMrGold = conf.mrGold.protocol + "://" + conf.mrGold.host + ":" + conf.mrGold.port
const domainVishnu = conf.vishnu.protocol + "://" + conf.vishnu.host + ":" + conf.vishnu.port

var rule = new schedule.RecurrenceRule();
rule.second = conf.app.updateTimes.seconds;

var times = 0;

const log = conf.app.log;
  
function updateSoccerGames(times) {

    // log
    if (log) { console.log("\nIteration: " + times + "."); }

    // logging changes in account
    loggs.loggAccountStatus(domainMrGold, times);


    // 1. IN PLAY GAMES. STRATEGIES BASED ON GAME STATUS
    unirest.get(domainMrGold + '/api/listInPlaySoccerEvents')
        .end(function (gamesInPlayResponse) {

            // log
            if (log) { console.log("Iteration: " + times +". Main controller. Got IN-PLAY soccer events for EVENTS controller from MR GOLD api"); }

            //##### Pass in-play soccer events to soccer events controller
            soccerEvents.catchSoccerEvents(gamesInPlayResponse, domainVishnu, domainMrGold, times);
            //#####
        })
        .on('error', function(e) {
            console.log("Error rerieving listInPlaySoccerEvents from Mr Grold API: " + e.message);
    });


    // 2. ALL (before "in-play") GAMES. STRATEGIES BASED ON ODDS
    unirest.get(domainMrGold + '/api/listSoccerEvents')
        .end(function (gamesAllResponse) {

            // log
            if (log) { console.log("Iteration: " + times +". Main controller. Got ALL soccer events for ODDS controller from MR GOLD api"); }
            //##### Pass all soccer events to soccer odds controller
            soccerOdds.updateOddChanges(gamesAllResponse.body, domainMrGold, times, false);
            //#####

           })
           .on('error', function(e) {
                console.log("Error rerieving listSoccerEvents for ODDS controller from Mr Grold API: " + e.message);
    });


    // 3. ALL IN-PLAY GAMES. STRATEGIES BASED ON ODDS
    unirest.get(domainMrGold + '/api/listInPlaySoccerEvents')
        .end(function (gamesInPlayResponse) {

            // log
            if (log) { console.log("Iteration: " + times +". Main controller. Got IN-PLAY soccer events for ODDS controller from MR GOLD api"); }
            //##### Pass in-play soccer events to soccer odds controller
            soccerOdds.updateOddChanges(gamesInPlayResponse.body, domainMrGold, times, true);
            //#####
        })
        .on('error', function(e) {
            console.log("Error rerieving listInPlaySoccerEvents for ODDS controller from Mr Grold API: " + e.message);
    });
}

module.exports = { run: function(app) { 

    var startTime = new Date().toLocaleString();

    app.set("view engine", "ejs");
    app.get("/", function(req, res) {
        res.render("front", { times: times, start:startTime });
    });

    console.log("START");

    schedule.scheduleJob(rule, function() {
        times++;
        updateSoccerGames(times);
    });
}}
