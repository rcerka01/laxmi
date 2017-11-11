var conf = require("../config/config");
var mongoose= require("mongoose");

var dbName = conf.db.name;
var dbLogin = conf.db.login;
var dbPassword = conf.db.password;

mongoose.Promise = global.Promise; // just must have
mongoose.connect("mongodb://" + dbLogin + ":" + dbPassword + "@ds143774.mlab.com:43774/" + dbName, {useMongoClient: true});

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
    comment: String
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
        comment) { return Action({
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
            comment: comment
        })
    }
}
