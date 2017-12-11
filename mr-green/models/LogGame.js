var conf = require("../config/config");
var mongoose= require("mongoose");

var dbName = conf.db.name;
var dbDomain = conf.db.domain;
var dbLogin = conf.db.login;
var dbPassword = conf.db.password;

mongoose.Promise = global.Promise; // just must have
mongoose.connect("mongodb://" + dbLogin + ":" + dbPassword + dbDomain + dbName, {useMongoClient: true});

var Schema = mongoose.Schema;

var gameSchema = new Schema({logGame: Schema.Types.Mixed});

var LogGame = mongoose.model("LogGame", gameSchema);

module.exports = {
    dataset: LogGame,
    newDataset: function (logGame) { return LogGame({logGame: logGame}) }
}
