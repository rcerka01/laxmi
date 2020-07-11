var conf = require("../config/config");
var mongoose= require("mongoose");

var dbName = conf.db.name;
var dbDomain = conf.db.domain;
var dbLogin = conf.db.login;
var dbPassword = conf.db.password;

mongoose.Promise = global.Promise; // just must have
mongoose.connect("mongodb://" + dbLogin + ":" + dbPassword + dbDomain + dbName, {useMongoClient: true});

var Schema = mongoose.Schema;

var VishnuSchema = new Schema({
    eventId: String,
    eventName: String,
    country: String,
    competition: String,
    datet: String,
    eventTypeId: String,
    score: Schema.Types.Mixed,
    runners: Schema.Types.Mixed,
    markets: Schema.Types.Mixed,
    timeElapsed: Number,
    elapsedRegularTime: Number,
    updateDetails: Array,
    status: String,
    inPlayMatchStatus: String
});

var Vishnu = mongoose.model("Vishnu", VishnuSchema);

module.exports = {
    dataset: Vishnu,
    newDataset: function (
        eventId,
        eventName,
        country,
        competition,
        datet,
        eventTypeId,
        score,
        runners,
        markets,
        timeElapsed,
        elapsedRegularTime,
        updateDetails,
        status
   ) { return Vishnu({
            eventId: eventId,
            eventName: eventName,
            country: country,
            competition: competition,
            datet: datet, 
            eventTypeId: eventTypeId,
            score: score,
            runners: runners,
            markets: markets,
            timeElapsed: timeElapsed,
            elapsedRegularTime: elapsedRegularTime,
            updateDetails: updateDetails,
            status: status
        })
    }
}
