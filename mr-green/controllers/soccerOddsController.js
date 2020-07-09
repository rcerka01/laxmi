var unirest = require('unirest');
var conf = require("../config/config");

const log = conf.app.log;

function updateOddChanges(games, gamesInPlay, domainVishnu, domainMrGold, times) {

    // retrieve all event Ids passed from main controller
    var eventIds = "";
    var eventIdsArr = [];

    for(var i in games) {
        eventIds = eventIds + games[i].id + ",";
        eventIdsArr.push(games[i].id)
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

                for (var i in marketCatalogue[i]) {

                    

                }
            
            }
        });

}

module.exports = { updateOddChanges: updateOddChanges }
