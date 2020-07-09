var unirest = require('unirest');
var conf = require("../config/config");

const log = conf.app.log;

function updateOddChanges(games, domainMrGold, times, isInline) {

    // retrieve all event Ids passed from main controller
    var eventIds = "";

    for(var i in games) {
        eventIds = eventIds + games[i].id + ",";
    }

    if (log) console.log("Iteration: " + times + ". Soccer Odds controller. Retrieved event ids: " + eventIds); 

    // RETRIEVE MARKET CATALOGUES
    unirest.get(domainMrGold + '/api/listCatalogue/' + eventIds)
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .end(function (marketCatalogueResponse) {

            // if have data
            if (marketCatalogueResponse.body.length > 0) {

                // log
                if (log) console.log("Iteration: " + times + ". Soccer Odds Controller. Retrieved market data for " + marketCatalogueResponse.body.length + " items"); 
            
                var marketCatalogue = marketCatalogueResponse.body

                function chunk(arr, chunkSize) {
                    var R = [];
                    for (var i=0,len=arr.length; i<len; i+=chunkSize)
                      R.push(arr.slice(i,i+chunkSize));
                    return R;
                }

                var  marketCatalogueDiv = chunk(marketCatalogue, 20);

                for (var i in marketCatalogueDiv) {

                    //retrieve all market Ids in subset
                    var marketIds = "";
                    var eventIds = "";
                    var eventName = "";
                    var eventCountrycode = "";
                    var competition = "";

                    for (var ii in marketCatalogueDiv[i]) {
                        marketIds = marketIds + marketCatalogueDiv[i][ii].item.marketId + ",";
                        eventIds = eventIds + marketCatalogueDiv[i][ii].item.event.id + ",";
                        eventName = eventName + marketCatalogueDiv[i][ii].item.event.name + ",";
                        eventCountrycode = eventCountrycode + marketCatalogueDiv[i][ii].item.event.countryCode + ",";
                        competition = competition + marketCatalogueDiv[i][ii].item.competition.name + ",";
                    }

                    // console.log("XXXX " + eventIds)
                    // console.log("YYYY " + eventName)
                    // console.log("ZZZZ " + eventCountrycode)
                    // console.log("NNNN " + competition)

                    // RETRIEVE ODDS
                    unirest.get(domainMrGold + '/api/listMarketBet/' + marketIds + "/" + eventIds + "/" + eventName + "/" + eventCountrycode + "/" + competition)
                           .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
                           .end(function (marketResponses) {

                                var markets = marketResponses.body;

                                // var odds = [];
                                // for (var mr in markets) {

                                //     odds.push({
                                //         marketId: markets[mr].item.marketId,
                                //        // eventId: ids[mr],
                                //         date: new Date(),
                                //         totalMatched: markets[mr].item.totalMatched,
                                //         selection: [{
                                //             selectionId:        markets[mr].item.runners[0].selectionId,
                                //             totalRunnerMatched: markets[mr].item.runners[0].totalMatched,
                                //             back: markets[mr].item.runners[0].ex.availableToBack[0],
                                //             lay: markets[mr].item.runners[0].ex.availableToLay[0] },
                                //            {
                                //             selectionId:        markets[mr].item.runners[1].selectionId,
                                //             totalRunnerMatched: markets[mr].item.runners[1].totalMatched,
                                //             back: markets[mr].item.runners[1].ex.availableToBack[0],
                                //             lay: markets[mr].item.runners[1].ex.availableToLay[0] },
                                //            {
                                //             date: new Date(),
                                //             selectionId:        markets[mr].item.runners[2].selectionId,
                                //             totalRunnerMatched: markets[mr].item.runners[2].totalMatched,
                                //             back: markets[mr].item.runners[2].ex.availableToBack[0],
                                //             lay: markets[mr].item.runners[2].ex.availableToLay[0]
                                //         }]   
                                //     });

                                // }

                                // console.log();
                                // console.log(odds.length + " #############################################################");
                                // console.log(odds);
                                // console.log("#############################################################");
                           });

                }
            }
        });

}

module.exports = { updateOddChanges: updateOddChanges }
