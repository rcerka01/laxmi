var unirest = require('unirest');
var bet = require("../models/Bet").newDataset;
var conf = require("../config/config");

const log = conf.app.log;

function placeBet(domainMrGold, eventId, name, elapsedTime) {

    // log
    if (log) { console.log(name + " PLACING BET."); }

    // RETRIEVE MARKET CATALOGUE
    unirest.get(domainMrGold + '/api/listCatalogue/' + eventId)
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .end(function (marketCatalogueResponse) {
            
            // if have data
            if (marketCatalogueResponse.body[0]) {

                // log
                if (log) { console.log(name + " PLACING BET. List catalogue from MR GOLD retrieved successfully"); }

                var marketCatalogue = marketCatalogueResponse.body[0];
       
                // for final output
                var eventName = marketCatalogue.item.event.name;

                var marketId = marketCatalogue.item.marketId;

                // log
                if (log) { console.log(name + " PLACING BET. Market id: " + marketId); }

                var runners = marketCatalogue.item.runners;

                // log
                if (log) { console.log(name + " PLACING BET. Loop trough runners"); }
                
                for (var r in runners) {
                    if (runners[r].runnerName == name) {

                        if (log) { console.log(name + " PLACING BET. Found correct runner (bet) by name " + runners[r].runnerName + " " + runners[r].selectionId); }

                        var selectionId = runners[r].selectionId;

                        // retrieve runner bet
                        unirest.get(domainMrGold + '/api/listRunnerBet/'+marketId+"/"+ selectionId)
                            .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
                            .end(function (listRunnerBetResponse) {

                                if (listRunnerBetResponse.body[0] !== 'undefined') {
                                    if (listRunnerBetResponse.body[0].item !== 'undefined') {
                                 
                                       if (listRunnerBetResponse.body[0].item.runners !== 'undefined') {
                                            if (listRunnerBetResponse.body[0].item.runners[0].ex !== 'undefined') {

                                                // log
                                                if (log) { console.log(name + " PLACING BET. List runner bet from MR GOLD, with all fields, recieved successfully"); }
                                                
                                                var backPrice = 0;
                                                var backSize = 0;
                                                var backSum = 0;
                                                if (listRunnerBetResponse.body[0].item.runners[0].ex.availableToBack[0]) {
                                                    backPrice = listRunnerBetResponse.body[0].item.runners[0].ex.availableToBack[0].price;
                                                    backSize = listRunnerBetResponse.body[0].item.runners[0].ex.availableToBack[0].size;
                                                }

                                                var layPrice = 0;
                                                var laySize = 0;
                                                var laySum = 0;
                                                if (listRunnerBetResponse.body[0].item.runners[0].ex.availableToLay[0]) {
                                                    layPrice = listRunnerBetResponse.body[0].item.runners[0].ex.availableToLay[0].price;                    
                                                    laySize = listRunnerBetResponse.body[0].item.runners[0].ex.availableToLay[0].size;                    
                                                }

 /******************************    PLACE BET AND SAVE IN DB    *******************************/ 
 // it just do it once, must do repitedly if short in credit or unsuccessful
                                                var sum = conf.soccer.bid;

                                                // max bet can be smaller than bet size in config
                                                if (backSize < sum) { backSum = backSize } else { backSum = sum } 
                                                if (laySize < sum) { laySum = laySize } else { laySum = sum } 

                                                // log
                                                if (log) { console.log(name + " PLACING BET. Ready for BACK bet. Market Id: " + marketId + " SelectionId: " + selectionId + " Sum: " + backSum + " Price: " + backPrice); }            

                                                unirest.get(domainMrGold + '/api/placeOrders/'+marketId+'/'+selectionId+'/'+backSum+'/'+backPrice)
                                                .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
                                                .end(function (placeOrdersResponse) {
                                                    var body = placeOrdersResponse.body;
                                                
                                                    if (body.instructionReports) var instructionReports = JSON.stringify(body.instructionReports[0]); else var instructionReports = "assummed error";
                                                    if (body.detail) var detail = JSON.stringify(body.detail); else var detail = "";

                                                    // log
                                                    if (log) console.log(name + " PLACING BET. BACK bet placed. " + instructionReports + ". " + detail);
                                                
                                                    // write in DB
                                                    bet(    
                                                        eventId = eventId,
                                                        date = Date(),
                                                        marketId = marketId,
                                                        selectionId = selectionId,
                                                        sum = backSum,
                                                        type = "back",
                                                        price = backPrice,
                                                        gameName = eventName,
                                                        placedOn = name,
                                                        elapsedTime = elapsedTime,
                                                        betStatus = {
                                                            "status": body.status,
                                                            "instructionReports": instructionReports,
                                                            "detail": detail
                                                        },
                                                        comment = "",
                                                        version =  conf.soccer.version,
                                                        isLive = true,
                                                        gameStatus = "IN_PLAY"
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
                    }
                }
            // if market catalog data    
            }
        });
        
        // log
        if (log) { console.log(name + " PLACING BET FINISHED."); }
}

module.exports = { placeBet: placeBet }
