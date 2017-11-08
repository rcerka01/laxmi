var conf = require("../config/config");
var mongoose= require("mongoose");

var dbName = conf.db.name;
var dbLogin = conf.db.login;
var dbPassword = conf.db.password;

mongoose.Promise = global.Promise; // just must have
mongoose.connect("mongodb://" + dbLogin + ":" + dbPassword + "@ds143774.mlab.com:43774/" + dbName, {useMongoClient: true});

var Schema = mongoose.Schema;

var eventSchema = new Schema({
    date: Date,
    eventType: String,
    gameType: String,
    gameId: String,
    gameName: String,
    country: String,
    openDate: Date,
    marketCount: Number,
    change: String,
    comment: String,
    runnerVersion: Number,
    runnerIteration: Number
});

var Event = mongoose.model("Event", eventSchema);

module.exports = {
    dataset: Event,
    newDataset: function (
        date,
        eventType,
        gameType,
        gameId,
        gameName,
        country,
        openDate,
        marketCount,
        change,
        comment,
        runnerVersion,
        runnerIteration) { return Event({
            date: date,
            eventType: eventType,
            gameType: gameType,
            gameId: gameId,
            gameName: gameName,
            country: country,
            openDate: openDate,
            marketCount: marketCount,
            change: change,
            comment: comment,
            runnerVersion: runnerVersion,
            runnerIteration: runnerIteration
        })
    }
}
