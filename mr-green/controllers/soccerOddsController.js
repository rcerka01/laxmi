var loggs = require("./soccerLoggController");
var unirest = require('unirest');
var conf = require("../config/config");

const log = conf.app.log;

function updateOddChanges(games, domainMrGold, times, isInPlay) {

    // clear all event Ids passed from main controller
    var eventIds = "";

    for(var i in games) {
        eventIds = eventIds + games[i].id + ",";
    }

    if (log) console.log("Iteration: " + times + ". Soccer Odds controller. In-play: " + isInPlay + ". Retrieved event ids: " + eventIds); 

    // RETRIEVE MARKET CATALOGUES
    unirest.get(domainMrGold + '/api/listCatalogue/' + eventIds)
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .end(function (marketCatalogueResponse) {

            // if have data
            if (marketCatalogueResponse.body.length > 0) {

                // log
                if (log) console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Soccer Odds Controller. Retrieved market data for " + marketCatalogueResponse.body.length + "  events"); 
            
                var marketCatalogue = marketCatalogueResponse.body

                function chunk(arr, chunkSize) {
                    var R = [];
                    for (var i=0,len=arr.length; i<len; i+=chunkSize)
                      R.push(arr.slice(i,i+chunkSize));
                    return R;
                }

                // for Betfair listMarketBook endpoine be able to consume markets are divided in chunks by 20
                var  marketCatalogueDiv = chunk(marketCatalogue, 20);

                for (var i in marketCatalogueDiv) {

                    //retrieve all market Ids in subset
                    var marketIds = "";
                    var eventIds = "";
                    var eventNames = "";
                    var eventCountrycodes = "";
                    var competitions = "";

                    // game stats (eventid, marketid, eventname etc.) is impossible to retrieve in listMarketBook endpint
                    // to access them we pass and rcieve them manually
                    for (var ii in marketCatalogueDiv[i]) {
                        marketIds = marketIds + marketCatalogueDiv[i][ii].item.marketId + ",";
                        eventIds = eventIds + marketCatalogueDiv[i][ii].item.event.id + ",";
                        eventNames = eventNames + marketCatalogueDiv[i][ii].item.event.name + ",";
                        eventCountrycodes = eventCountrycodes + marketCatalogueDiv[i][ii].item.event.countryCode + ",";
                        competitions = competitions + marketCatalogueDiv[i][ii].item.competition.name + ",";
                    }

                    // RETRIEVE ODDS
                    unirest.get(domainMrGold + '/api/listMarketBet/' + 
                                encodeURIComponent(marketIds) + "/" + 
                                encodeURIComponent(eventIds) + "/" + 
                                encodeURIComponent(eventNames) + "/" + 
                                encodeURIComponent(eventCountrycodes) + "/" + 
                                encodeURIComponent(competitions))
                           .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
                           .end(function (marketResponses) {

                                var markets = marketResponses.body;

                                var odds = [];
                                for (var mr in markets) {

                                    // form array with odds and other game stats
                                    odds.push({
                                        marketId: markets[mr].item.marketId,
                                        eventId: markets[mr].eventId,
                                        eventName: markets[mr].eventName,
                                        eventCountryIds: markets[mr].eventCountryIds,
                                        competition: markets[mr].competition,
                                        date: new Date(),
                                        totalMatched: markets[mr].item.totalMatched,
                                        selection: [{
                                            selectionId:        markets[mr].item.runners[0].selectionId,
                                            totalRunnerMatched: markets[mr].item.runners[0].totalMatched,
                                            back: markets[mr].item.runners[0].ex.availableToBack[0],
                                            lay: markets[mr].item.runners[0].ex.availableToLay[0] },
                                           {
                                            selectionId:        markets[mr].item.runners[1].selectionId,
                                            totalRunnerMatched: markets[mr].item.runners[1].totalMatched,
                                            back: markets[mr].item.runners[1].ex.availableToBack[0],
                                            lay: markets[mr].item.runners[1].ex.availableToLay[0] },
                                           {
                                            date: new Date(),
                                            selectionId:        markets[mr].item.runners[2].selectionId,
                                            totalRunnerMatched: markets[mr].item.runners[2].totalMatched,
                                            back: markets[mr].item.runners[2].ex.availableToBack[0],
                                            lay: markets[mr].item.runners[2].ex.availableToLay[0]
                                        }]   
                                    });

                                }

                                if (log) console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Soccer Odds Controller. " + odds.length + " items of " + marketCatalogueResponse.body.length + " formed and sent to Logg controller"); 

                                //##### send odds and other game stats to logg controller
                                loggs.loggOdds(odds, times, isInPlay);
                                //#####

                           });

                }
            }
        });

}

module.exports = { updateOddChanges: updateOddChanges }
