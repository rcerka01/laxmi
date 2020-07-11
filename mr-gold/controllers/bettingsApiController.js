var conf = require("../config/config");
var request = require("request");
var dateFormat = require('dateformat');

/************************************** URL ***************************************** */

var urlEventTypesList = "https://api.betfair.com/exchange/betting/rest/v1.0/listEventTypes/";
var urlCatalogueList = "https://api.betfair.com/exchange/betting/rest/v1.0/listMarketCatalogue/";
var urlMarketBookList = "https://api.betfair.com/exchange/betting/rest/v1.0/listMarketBook/";
var urlRunnerBookList = "https://api.betfair.com/exchange/betting/rest/v1.0/listRunnerBook/";
var urlPlaceOrders = "https://api.betfair.com/exchange/betting/rest/v1.0/placeOrders/";

/************************************** BODY ***************************************** */

var bodyEventTypesList = { filter: { } }
function bodySocerEventsList(nowIso, tomorrowIso) { return { 
    filter: { eventTypeIds: [ 1 ],
    marketStartTime: {
    from: nowIso,
    to: tomorrowIso     
}}}}

function bodySocerInPlayEvents(nowIso, tomorrowIso) { return { 
    filter: { 
        eventTypeIds: [ 1 ],
        inPlayOnly: true },
    maxResults : 1000 
}}

function bodyCatalogueList(eventIds) { return { 
    filter: {
        eventIds: eventIds.split(","),
        marketBettingTypes: ["ODDS"],
        marketTypeCodes: ["MATCH_ODDS"]
    },
    marketProjection: [
            "COMPETITION",
            "EVENT",
            "EVENT_TYPE",
            "RUNNER_DESCRIPTION",
            "RUNNER_METADATA",
            "MARKET_START_TIME"
        ],
    maxResults: 1000
}}

function bodyMarketBookList(marketIds) {
    var marketIdsArr = marketIds.split(",")
    return { 
        marketIds: marketIdsArr,
        priceProjection: {
            priceData: ["EX_BEST_OFFERS"],
            virtualise: true
        }
    }
}

function bodyRunnerBookList(marketId, selectionId) { return { 
    marketId: marketId,
    selectionId: selectionId,
    priceProjection:{
    priceData: [
        "EX_ALL_OFFERS",
        "SP_AVAILABLE",
        "SP_TRADED",
        "EX_BEST_OFFERS",
        "EX_ALL_OFFERS",
        "EX_ALL_OFFERS",
        "EX_BEST_OFFERS",
        "EX_TRADED"]
}}}	

function bodyPlaceOrders(marketId, selectionId, size, price) { return { 
    marketId: marketId,
    instructions: [
        {
            selectionId: selectionId,
            handicap: "0",
            side: "BACK",
            orderType: "LIMIT",
            limitOrder: {
                size: size,
                price: price,
                persistenceType: "LAPSE"
            }
        }
    ]
}}

/************************************** OPTIONS ***************************************** */

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
    // * GET List Market Catalogue (all game items by passing game id)
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
    // * GET List Market Bet (by passing market id)
    // ****************************************************
   
    app.get("/api/listMarketBet/:marketid/:eventid/:eventname/:countryid/:competition/:selections", function(req, res) {
        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {

                var eventIds = req.params.eventid;
                var eventNames = req.params.eventname;
                var eventCountryIds = req.params.countryid;
                var competitions = req.params.competition;
                var selections = req.params.selections;

                var eventIdsArr = eventIds.split(",");
                var eventNamesArr = eventNames.split(",");
                var eventCountryIdsArr = eventCountryIds.split(",");
                var competitionsArr = competitions.split(",");
                var selectionsArr = selections.split(",");
              
                var output = [];

                body.map(function(item, i) { 
                    var runnersOutput = [];  
                    var runners = selectionsArr[i].split("---");  
                    
                    runnersOutput.push({
                        selectionId: runners[0],
                        runnerName: runners[1]
                    })
                                   
                    return output.push({
                        item,
                        eventId: eventIdsArr[i],
                        eventName: eventNamesArr[i],
                        eventCountryIds: eventCountryIdsArr[i],
                        competition: competitionsArr[i],
                        runners: runnersOutput
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

        request.post(options(urlMarketBookList, token, bodyMarketBookList(req.params.marketid)), callback);
    });

    // ****************************************************
    // * GET List Runner Bet (by passing market id)
    // ****************************************************
    app.get("/api/listRunnerBet/:marketid/:selectionid", function(req, res) {
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
        
       request.post(options(urlRunnerBookList, token, bodyRunnerBookList(req.params.marketid,req.params.selectionid)), callback);
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
    // * GET List Runner Bet (by passing market id)
    // ****************************************************
    app.get("/api/placeOrders/:marketid/:selectionid/:size/:price", function(req, res) {
        function callback(error, response, body) {
            if (!error && (response.statusCode == 200 || response.statusCode == 400)) {
                res.json(response.body)
             } else {
                console.log("Unexpected error from " + req.url +", " + error)
                res.json({error});
             }
        }
        
       request.post(options(urlPlaceOrders, token, bodyPlaceOrders(
                                                    req.params.marketid,
                                                    req.params.selectionid,
                                                    req.params.size,
                                                    req.params.price)), callback);
    });

    // ****************************************************
    // * List Socer Events
    // * Soccer calls with different body
    // ****************************************************

    var soccerController = require("./soccerApiController");
    soccerController("/api/listSoccerEvents", app, options, token, bodySocerEventsList);
    soccerController("/api/listInPlaySoccerEvents", app, options, token, bodySocerInPlayEvents);
}
