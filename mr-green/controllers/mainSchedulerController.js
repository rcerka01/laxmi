var schedule = require('node-schedule');
var unirest = require('unirest');
var conf = require("../config/config");
var soccerEvents = require("./soccerSchedulerController");
var util = require("./utilities");

const domain = conf.mrGreen.protocol + "://" + conf.mrGreen.host + ":" + conf.mrGreen.port

var rule = new schedule.RecurrenceRule();
rule.second = conf.app.updateTimes.seconds;

var times = 0;
var version = 0;

function updateSoccerGames(times) {
    unirest.get(domain + '/api/listInPlaySoccerEvents')
            .end(function (response) {

                // first iteration, detect version (restart)                              
                if (times == 1) {
                    console.log("first iteration after restart")
                    version = 0 // at the moment there is no need to detect it
                }
                
                // run event catcher
                soccerEvents.logSoccerEvents(response.body, times, version);
            })
            .on('error', function(e) {
                console.log("Error rerieving listInPlaySoccerEvents from API: " + e.message);
    });
}

module.exports = { run: function(app) { 
    schedule.scheduleJob(rule, function() {
        times++;
        updateSoccerGames(times);
    });
}}
