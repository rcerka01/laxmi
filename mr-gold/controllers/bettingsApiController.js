var conf = require("../config/config");
var request = require("request");
var dateFormat = require('dateformat');

var urlEventTypesList = "https://api.betfair.com/exchange/betting/rest/v1.0/listEventTypes/";
var urlCatalogueList = "https://api.betfair.com/exchange/betting/rest/v1.0/listMarketCatalogue/";
var urlBookList = "https://api.betfair.com/exchange/betting/rest/v1.0/listMarketBook/";

var bodyEventTypesList = { filter: { } }
function bodySocerEventsList(nowIso, tomorrowIso) { return { filter: { eventTypeIds: [ 1 ],
                                      marketStartTime: {
                                        from: nowIso,
                                        to: tomorrowIso     
                                    }}}}
function bodySocerInPlayEvents(nowIso, tomorrowIso) { return { filter: { eventTypeIds: [ 1 ],
                                        inPlayOnly: true },
                                        maxResults : 100 
                                    }}
function bodyCatalogueList(eventIds) { return { 	filter: {
                                            eventIds: [eventIds]
                                        },
                                        marketProjection: [
                                                "COMPETITION",
                                                "EVENT",
                                                "EVENT_TYPE",
                                                "RUNNER_DESCRIPTION",
                                                "RUNNER_METADATA",
                                                "MARKET_START_TIME"
                                            ],
                                        maxResults: 10
                                    }}
function bodyBookList(marketIds) { return { marketIds: [marketIds],
                                            priceProjection: {
                                                priceData: ["EX_BEST_OFFERS", "EX_TRADED"],
                                                virtualise: true
                                            }}}

function options(url, token, body) {
    return {
        url: url,
        method: "POST",
        body: body,
        json: true,
        headers: {
            "Content-Type": "application/json",
            "Accept": "text/json",
            'X-Application': conf.user.apiKey,
            'X-Authentication': token }
        }
};

module.exports = function(app, token) {
    var utilities = require("./utilities");

    // ****************************************************
    // * GET List Catalogue (all game items by passing game id)
    // ****************************************************
    app.get("/api/listCatalogue/:eventid", function(req, res) {
        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                
                var output = [];
                body.map(item => {                    
                    output.push({
                        item
                    })
            });

           res.json(output);
            
            } else if (response.statusCode == 400) { 
                utilities.recoverFromUnauthorisedRequest(app, req, res) 
             } else {
                console.log("Unexpected error from " + req.url +", " + error)
                res.json([]);
             }
        }

        request.post(options(urlCatalogueList, token, bodyCatalogueList(req.params.eventid)), callback);
    });

    // ****************************************************
    // * GET List Bet (by passing market id)
    // ****************************************************
    app.get("/api/listBet/:marketid", function(req, res) {
        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                
                var output = [];
                body.map(item => {                    
                    output.push({
                        item
                    })
            });

           res.json(output);
            
            } else if (response.statusCode == 400) { 
                utilities.recoverFromUnauthorisedRequest(app, req, res) 
             } else {
                console.log("Unexpected error from " + req.url +", " + error)
                res.json([]);
             }
        }

        request.post(options(urlBookList, token, bodyBookList(req.params.marketid)), callback);
    });

    // ****************************************************
    // * GET List Event Types (Soccer, Tenis, etc.)
    // ****************************************************
    app.get("/api/listEventTypes", function(req, res) {
        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                
                var output = [];
                body.map(item => 
                    output.push({
                        id: item.eventType.id,
                        name: item.eventType.name,
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

        request.post(options(urlEventTypesList, token, bodyEventTypesList), callback);
    });

    // ****************************************************
    // * List Socer Events
    // * Soccer calls with different body
    // ****************************************************

    var soccerController = require("./soccerApiController");
    soccerController("/api/listSoccerEvents", app, options, token, bodySocerEventsList);
    soccerController("/api/listInPlaySoccerEvents", app, options, token, bodySocerInPlayEvents);
}
