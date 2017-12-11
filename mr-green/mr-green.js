var conf = require("./config/config");

var express = require('express');
var app = express();

app.set("view engine", "ejs");
app.use("/assets", express.static(__dirname + "/public"));

app.get("/", function(req, res) {
    res.render("temp");
});
 
var mainSchedulerController = require('./controllers/soccerMainController');
mainSchedulerController.run();

app.listen(conf.app.port);
