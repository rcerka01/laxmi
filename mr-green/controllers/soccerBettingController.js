var unirest = require('unirest');
var action = require("../models/Action").newDataset;
var conf = require("../config/config");

function placeBet(domainMrGold, eventId, marketId, name, elapsedTime) {

    // RETRIEVE MARKET CATALOGUE
    /////////////////////////////////////////////////////////////////////
    unirest.get(domainMrGold + '/api/listCatalogue/' + eventId)
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

                        unirest.get(domainMrGold + '/api/listRunnerBet/'+marketId+"/"+ selectionId)
                            .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
                            .end(function (listRunnerBetResponse) {

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

 /******************************    PLACE BET AND SAVE ACTION    *******************************/ 
 // it just do it once, must do repitedly if sort in credit 
                                                var sum = conf.soccer.bid;

                                                unirest.get(domainMrGold + '/api/placeOrders/'+marketId+'/'+selectionId+'/'+sum+'/'+back)
                                                .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
                                                .end(function (placeOrdersResponse) {
                                                    var body = placeOrdersResponse.body;
                                                
                                                    if (body.instructionReports) var instructionReports = body.instructionReports[0]; else var instructionReports = "";
                                                    if (body.detail) var detail = body.detail; else var detail = "";
                                                
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
                                                        betStatus = {
                                                            "status": body.status,
                                                            "instructionReports": instructionReports,
                                                            "detail": detail
                                                        },
                                                        comment = "v1.2"
                                                    ).save(function(err) {
                                                        if (err) {
                                                            console.log("ERROR writing ACTION to DB: " + err);                        
                                                            throw err;
                                                        } 
                                                    });
                                                });

/************************************************************************************************/                     
                                            }
                                        }
                                    }
                                }
                            });
                        // FINISH RETRIEVE RUNNER BET
                        /////////////////////////////////////////////////////////////////////
                    }
                }
            // if market catalog data    
            }
        });
}

module.exports = { placeBet: placeBet }
