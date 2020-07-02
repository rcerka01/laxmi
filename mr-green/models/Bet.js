var conf = require("../config/config");
var mongoose= require("mongoose");

var dbName = conf.db.name;
var dbDomain = conf.db.domain;
var dbLogin = conf.db.login;
var dbPassword = conf.db.password;

mongoose.Promise = global.Promise; // just must have
mongoose.connect("mongodb://" + dbLogin + ":" + dbPassword + dbDomain + dbName, {useMongoClient: true});

var Schema = mongoose.Schema;

var betSchema = new Schema({
    eventId: String,
    date: Date,
    marketId: String,
    selectionId: String,
    sum: String,
    type: String,
    price: Number,
    gameName: String,
    placedOn: String,
    elapsedTime: Number,
    betStatus: Schema.Types.Mixed,
    comment: String,
    version: String,
    isLive: Boolean,
    gameStatus: String,
    score: Schema.Types.Mixed
});

var Bet = mongoose.model("Bet", betSchema);

module.exports = {
    dataset: Bet,
    newDataset: function (
        eventId,
        date,
        marketId,
        selectionId,
        sum,
        type,
        price,
        gameName,
        placedOn,
        elapsedTime,
        betStatus,
        comment,
        version,
        isLive,
        gameStatus,
        score) { return Bet({
            eventId: eventId,
            date: date,
            marketId: marketId,
            selectionId: selectionId,
            sum: sum,
            type: type,
            price: price,
            gameName: gameName,
            placedOn: placedOn,
            elapsedTime: elapsedTime,
            betStatus: betStatus,
            comment: comment,
            version:version,
            isLive: isLive,
            gameStatus: gameStatus,
            score: score})
    }
}
