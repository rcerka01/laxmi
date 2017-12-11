var conf = require("../config/config");
var mongoose= require("mongoose");

var dbName = conf.db.name;
var dbDomain = conf.db.domain;
var dbLogin = conf.db.login;
var dbPassword = conf.db.password;

mongoose.Promise = global.Promise; // just must have
mongoose.connect("mongodb://" + dbLogin + ":" + dbPassword + dbDomain + dbName, {useMongoClient: true});

var Schema = mongoose.Schema;

var resultSchema = new Schema({logResult: Schema.Types.Mixed});

var LogResult = mongoose.model("LogResult", resultSchema);

module.exports = {
    dataset: LogResult,
    newDataset: function (logResult) { return LogResult({logResult: logResult}) }
}
