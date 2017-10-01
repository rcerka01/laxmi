var request = require("request");
var dateFormat = require('dateformat');

var urlSocerEventsList = "https://api.betfair.com/exchange/betting/rest/v1.0/listEvents/";

module.exports = function(path, app, options, token, bodySocerEventsList) {
    app.get(path, function(req, res) {
      function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            
            var output = [];
            body.map(item => 
                output.push({
                    id: item.event.id,
                    name: item.event.name,
                    country: item.event.countryCode,
                    open_date: item.event.openDate, //dateFormat(item.event.openDate,'d mmm yyyy HH:MMtt'),
                    market_count: item.marketCount
                })
            );

            output.sort( (a,b) => Number(b.market_count) - Number(a.market_count) )

            res.json(output);

        } else if (response.statusCode == 400) { 
            utilities.recoverFromUnauthorisedRequest(app, req, res) 
        } else {
            console.log("Unexpected error from " + req.url + ", " + error)
            res.json([]);
        }
      }

      var now = new Date()
      var nowIso = dateFormat(now, "isoDateTime")
      var tomorrowIso = dateFormat(new Date().setDate(now.getDate() + 1), "isoDateTime")

      request.post(options(urlSocerEventsList, token, bodySocerEventsList(nowIso, tomorrowIso)), callback);
  });
}
