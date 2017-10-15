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

                // var event = require("../models/Event").dataset;                                
                if (times == 1) {
                    version = util;
                    console.log("YYYY " + util);
                    // event.findOne({}, {}, { sort: { 'runnerVersion': -1 } }, function(err, post) {
                    //     if (post) {
                    //         version = post.runnerVersion + 1; 
                    //         console.log("XXX " + post.runnerVersion);
                    //         console.log("VERSION NOW: " + version);
                    //     } else {
                    //         version = 0;
                    //     }
                    //     console.log("Initial load, new runner version initialaised " + version);                 
                    // });
                }


                console.log("VERSION GOING OUT: " + version);
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
