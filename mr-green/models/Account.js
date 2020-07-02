var conf = require("../config/config");
var mongoose= require("mongoose");

var dbName = conf.db.name;
var dbDomain = conf.db.domain;
var dbLogin = conf.db.login;
var dbPassword = conf.db.password;

mongoose.Promise = global.Promise; // just must have
mongoose.connect("mongodb://" + dbLogin + ":" + dbPassword + dbDomain + dbName, {useMongoClient: true});

var Schema = mongoose.Schema;

var statusSchema = new Schema({account: Schema.Types.Mixed});

var Account = mongoose.model("Account", statusSchema);

module.exports = {
    dataset: Account,
    newDataset: function (account) { return Account({account: account}) }
}
