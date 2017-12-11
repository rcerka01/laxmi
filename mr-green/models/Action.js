var conf = require("../config/config");
var mongoose= require("mongoose");

var dbName = conf.db.name;
var dbDomain = conf.db.domain;
var dbLogin = conf.db.login;
var dbPassword = conf.db.password;

mongoose.Promise = global.Promise; // just must have
mongoose.connect("mongodb://" + dbLogin + ":" + dbPassword + dbDomain + dbName, {useMongoClient: true});

var Schema = mongoose.Schema;

var actionSchema = new Schema({
    date: Date,
    gameName: String,
    vinner: String,
    eventId: String,
    marketId: String,
    selectionId: String,
    elapsedTime: Number,
    back: Number,
    lay: Number,
    results: String,
    betStatus: Schema.Types.Mixed,
    comment: String,
    version: String
});

var Action = mongoose.model("Action", actionSchema);

module.exports = {
    dataset: Action,
    newDataset: function (
        date,
        gameName,
        vinner,
        eventId,
        marketId,
        selectionId,
        elapsedTime,
        back,
        lay,
        results,
        betStatus,
        comment,
        version) { return Action({
            date: date,
            gameName: gameName,
            vinner: vinner,
            eventId: eventId,
            marketId: marketId,
            selectionId: selectionId,
            elapsedTime: elapsedTime,
            back: back,
            lay: lay,
            results: results,
            betStatus: betStatus,
            comment: comment,
            version:version
        })
    }
}
