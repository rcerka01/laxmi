var conf = require("./config/config");

var express = require('express');
var app = express();

app.use("/assets", express.static(__dirname + "/public"));
 
var mainSchedulerController = require('./controllers/soccerMainController');
mainSchedulerController.run(app);

app.listen(conf.app.port);
