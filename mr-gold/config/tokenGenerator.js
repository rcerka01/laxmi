var conf = require("./config");
var request = require('request');

var fs = require('fs')
    , path = require('path')
    , certFile = path.resolve(__dirname, "../cert/" + conf.user.cert.public)
    , keyFile = path.resolve(__dirname, "../cert/"  + conf.user.cert.private)
    , request = require('request');

var json = { username: conf.user.username, password: conf.user.password }

var options = {
  url: 'https://identitysso.betfair.com/api/certlogin',
  method: "POST",
  form: json,
  json: true,
  agentOptions: {
        cert: fs.readFileSync(certFile),
        key: fs.readFileSync(keyFile),
        passphrase: conf.user.cert.passphrase
    },
  headers: {
        'X-Application': conf.user.apiKey,
        'Content-Type': "application/application/x-www-form-urlencoded"}
}

module.exports = function(callback, token) { 
      request.post(options, callback); 
}
