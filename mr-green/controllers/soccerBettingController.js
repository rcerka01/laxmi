var unirest = require('unirest');
var action = require("../models/Action").newDataset;

function placeBet(domainMrGreen, eventId, marketId, name, elapsedTime) {

    // RETRIEVE MARKET CATALOGUE
    /////////////////////////////////////////////////////////////////////
    unirest.get(domainMrGreen + '/api/listCatalogue/' + eventId)
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .end(function (marketCatalogueResponse) {
            
            // if have data
            if (marketCatalogueResponse.body[0] !== 'undefined') {
                          
                // for final output
                var eventName = "";
                if (marketCatalogueResponse.body[0]) {
                    eventName = marketCatalogueResponse.body[0].item.event.name;
                }

                var runners = marketCatalogueResponse.body[0].item.runners;
                
                for (var r in runners) {
                    if (runners[r].runnerName == name) {

                        var selectionId = runners[r].selectionId;

                        // RETRIEVE RUNNER BET
                        /////////////////////////////////////////////////////////////////////

                        unirest.get(domainMrGreen + '/api/listRunnerBet/'+marketId+"/"+ selectionId)
                            .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
                            .end(function (listRunnerBetResponse) {

                                console.log("ITEM")

                                if (listRunnerBetResponse.body[0] !== 'undefined') {
                                    if (listRunnerBetResponse.body[0].item !== 'undefined') {
                                        if (listRunnerBetResponse.body[0].item.runners !== 'undefined') {
                                            if (listRunnerBetResponse.body[0].item.runners[0].ex !== 'undefined') {
                                                
                                                var back = 0;
                                                if (listRunnerBetResponse.body[0].item.runners[0].ex.availableToBack[0]) {
/* DO VE HAVE TO TAKE FIRST VALUE ??? */            back = listRunnerBetResponse.body[0].item.runners[0].ex.availableToBack[0].price;
                                                }

                                                var lay = 0;
                                                if (listRunnerBetResponse.body[0].item.runners[0].ex.availableToLay[0]) {
 /* DO VE HAVE TO TAKE FIRST VALUE ??? */           lay = listRunnerBetResponse.body[0].item.runners[0].ex.availableToLay[0].price;
                                                }

                                                action(
                                                    date = Date(),
                                                    gameName = eventName,
                                                    vinner = name,
                                                    eventId = eventId,
                                                    marketId = marketId,
                                                    selectionId = selectionId,
                                                    elapsedTime = elapsedTime,
                                                    back = back,
                                                    lay = lay,
                                                    results = "",
                                                    comment = ""
                                                    ).save(function(err) {
                                                        if (err) {
                                                            console.log("ERROR writing ACTION to DB");                        
                                                            throw err;
                                                        } 
                                                    });
                                                
                                                console.log("IT HAPPEN")
                                                console.log("EVENT_NAME: " + eventName)
                                                console.log("VINNER: " + name)
                                                console.log("EVENT_ID: " + eventId)
                                                console.log("MARKET_ID: " + marketId)
                                                console.log("SELECTION_ID: " + selectionId)
                                                console.log("ELAPSED_TIME: " + elapsedTime) 
                                                if (listRunnerBetResponse.body[0].item.runners[0].ex.availableToBack[0]) {
/* DO VE HAVE TO TAKE FIRST VALUE ??? */            console.log("AVAILABLE_TO_BACK: " + listRunnerBetResponse.body[0].item.runners[0].ex.availableToBack[0].price)
                                                }
                                                if (listRunnerBetResponse.body[0].item.runners[0].ex.availableToLay[0]) {
 /* DO VE HAVE TO TAKE FIRST VALUE ??? */           console.log("AVAILABLE_TO_LAY: " + listRunnerBetResponse.body[0].item.runners[0].ex.availableToLay[0].price)
                                                }
                                                console.log("")
                                            }
                                        }
                                    }
                                }
                            });

                        /////////////////////////////////////////////////////////////////////
                    }
                }
            // if market catalog data    
            }
        });
}

module.exports = { placeBet: placeBet }
