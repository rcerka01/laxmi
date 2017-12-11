var schedule = require('node-schedule');
var unirest = require('unirest');
var conf = require("../config/config");
var soccerEvents = require("./soccerEventController");
//var soccerLoggs = require("./soccerLoggController");
var util = require("./utilities");

const domainMrGold = conf.mrGold.protocol + "://" + conf.mrGold.host + ":" + conf.mrGold.port
const domainVishnu = conf.vishnu.protocol + "://" + conf.vishnu.host + ":" + conf.vishnu.port

var rule = new schedule.RecurrenceRule();
rule.second = conf.app.updateTimes.seconds;

var times = 0;
var version = 0;

function updateSoccerGames(times) {
    unirest.get(domainMrGold + '/api/listInPlaySoccerEvents')
            .end(function (gamesInPlayResponse) {

                // first iteration, detect version (restart)                              
                if (times == 1) {
                    console.log("first iteration after restart")
                    version = 0 // at the moment there is no need to detect it
                }

                // CATCING CONDITIONS
                soccerEvents.catchSoccerEvents(gamesInPlayResponse, domainVishnu, domainMrGold);

                // LOGGING CHANGES
                //soccerLoggs.logSoccerEvents(gamesInPlayResponse, times, version);
            })
            .on('error', function(e) {
                console.log("Error rerieving listInPlaySoccerEvents from Mr Grold API: " + e.message);
    });
}

module.exports = { run: function(app) { 
    schedule.scheduleJob(rule, function() {
        times++;
        updateSoccerGames(times);
    });
}}
