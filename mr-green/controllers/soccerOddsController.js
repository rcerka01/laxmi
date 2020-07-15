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

                // for Betfairs listMarketBook endpoint be able to consume, markets are divided in chunks by 20
                var  marketCatalogueDiv = chunk(marketCatalogue, 20);

                for (var i in marketCatalogueDiv) {

                    //retrieve all market Ids in subset
                    var marketIds = "";
                    var eventIds = "";
                    var eventNames = "";
                    var eventCountrycodes = "";
                    var competitions = "";
                    var selections = "";
                    var openDates = "";
                    
                    // game stats (eventid, marketid, eventname etc.) is not present in listMarketBook endpint
                    // to access them we pass and rcieve them manually
                    for (var ii in marketCatalogueDiv[i]) {
                        var runnersStr = "";
                        var runners = marketCatalogueDiv[i][ii].item.runners;
                        for (var iii in runners) {
                            runnersStr = runnersStr + runners[iii].selectionId + "+++" + runners[iii].runnerName + "---"       
                        }

                        selections = selections + runnersStr + ",";
                        try { marketIds = marketIds + marketCatalogueDiv[i][ii].item.marketId + ","; } catch(e) { marketIds = marketIds + ","; }
                        try { eventIds = eventIds + marketCatalogueDiv[i][ii].item.event.id + ","; } catch(e) { eventIds = eventIds + ","; }
                        try { eventNames = eventNames + marketCatalogueDiv[i][ii].item.event.name + ","; } catch(e) { eventNames = eventNames + ","; }
                        try { eventCountrycodes = eventCountrycodes + marketCatalogueDiv[i][ii].item.event.countryCode + ","; } catch(e) { eventCountrycodes = eventCountrycodes + ","; }
                        try { competitions = competitions + marketCatalogueDiv[i][ii].item.competition.name + ","; } catch(e) { competitions = competitions + ","; }
                        try { openDates = openDates + marketCatalogueDiv[i][ii].item.event.openDate + ","; } catch(e) { openDates = openDates + ","; }
                    }

                    // RETRIEVE ODDS
                    unirest.get(domainMrGold + '/api/listMarketBet/' + 
                                encodeURIComponent(marketIds) + "/" + 
                                encodeURIComponent(eventIds) + "/" + 
                                encodeURIComponent(eventNames) + "/" + 
                                encodeURIComponent(eventCountrycodes) + "/" + 
                                encodeURIComponent(competitions) + "/" + 
                                encodeURIComponent(selections) + "/" + 
                                encodeURIComponent(openDates)) 
                           .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
                           .end(function (marketResponses) {

                                var markets = marketResponses.body;

                                var dataOut = [];
                                for (var mr in markets) {

                                    try { var back0price = markets[mr].item.runners[0].ex.availableToBack[0].price } catch (e) { var back0price = 0 };
                                    try { var back0size = markets[mr].item.runners[0].ex.availableToBack[0].size } catch (e) { var back0size = 0 };
                                    try { var lay0price = markets[mr].item.runners[0].ex.availableToLay[0].price } catch (e) { var lay0price = 0 };
                                    try { var lay0size = markets[mr].item.runners[0].ex.availableToLay[0].size } catch (e) { var lay0size = 0 };
                                    
                                    try { var back1price = markets[mr].item.runners[1].ex.availableToBack[0].price } catch (e) { var back1price = 0 };
                                    try { var back1size = markets[mr].item.runners[1].ex.availableToBack[0].size } catch (e) { var back1size = 0 };
                                    try { var lay1price = markets[mr].item.runners[1].ex.availableToLay[0].price } catch (e) { var lay1price = 0 };
                                    try { var lay1size = markets[mr].item.runners[1].ex.availableToLay[0].size } catch (e) { var lay1size = 0 };
                                    
                                    try { var back2price = markets[mr].item.runners[2].ex.availableToBack[0].price } catch (e) { var back2price = 0 };
                                    try { var back2size = markets[mr].item.runners[2].ex.availableToBack[0].size } catch (e) { var back2size = 0 };
                                    try { var lay2price = markets[mr].item.runners[2].ex.availableToLay[0].price } catch (e) { var lay2price = 0 };
                                    try { var lay2size = markets[mr].item.runners[2].ex.availableToLay[0].size } catch (e) { var lay2size = 0 };
                                    
                                    // form array with odds and other game stats
                                    dataOut.push({
                                        marketId: markets[mr].item.marketId,
                                        eventId: markets[mr].parameters.eventId,
                                        eventName: markets[mr].parameters.eventName,
                                        eventCountryIds: markets[mr].parameters.eventCountryIds,
                                        competition: markets[mr].parameters.competition,
                                        totalMatched: markets[mr].item.totalMatched,
                                        selectionIds: markets[mr].parameters.selections,
                                        openDate: markets[mr].parameters.openDate,
                                        odds: [{
                                            selectionId:        markets[mr].item.runners[0].selectionId,
                                            totalRunnerMatched: markets[mr].item.runners[0].totalMatched,
                                            back: [{
                                                updated: new Date(),
                                                size: back0size,
                                                price: back0price
                                                 }],
                                            lay: [{
                                                updated: new Date(), 
                                                size: lay0size, 
                                                price: lay0price
                                                }]
                                            },
                                           {
                                            selectionId:        markets[mr].item.runners[1].selectionId,
                                            totalRunnerMatched: markets[mr].item.runners[1].totalMatched,
                                            back: [{
                                                updated: new Date(),
                                                size: back1size,
                                                price: back1price
                                                 }],
                                            lay: [{
                                                updated: new Date(),
                                                size: lay1size,
                                                price: lay1price,
                                                 }]
                                            },
                                           {
                                            selectionId:        markets[mr].item.runners[2].selectionId,
                                            totalRunnerMatched: markets[mr].item.runners[2].totalMatched,
                                            back: [{
                                                updated: new Date(),
                                                size: back2size,
                                                price: back2price,
                                                }],
                                            lay: [{
                                                updated: new Date(),
                                                size: lay2size,
                                                price: lay2price
                                                 }]

                                            }]   
                                        });

                                    }

                                if (log) console.log("Iteration: " + times + ". In-play: " + isInPlay + ". Soccer Odds Controller. " + dataOut.length + " items of " + marketCatalogueResponse.body.length + " formed and sent to Logg controller"); 

                                //##### send odds and other game stats to logg controller
                                loggs.loggOdds(dataOut, times, isInPlay);
                                //#####

                           });

                }
            }
        });

}

module.exports = { updateOddChanges: updateOddChanges }
