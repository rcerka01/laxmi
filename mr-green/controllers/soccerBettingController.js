var unirest = require('unirest');

function placeBet(domainMrGreen, eventId, marketId, name) {

    // retrieve market catalogue
    unirest.get(domainMrGreen + '/api/listCatalogue/' + eventId)
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .end(function (marketCatalogueResponse) {

            var catalogue = marketCatalogueResponse.body

            console.log(catalogue);

            console.log("IT HAPPEN !!!!!")
            console.log(eventId)
            console.log(marketId)
            console.log(name)
        });
}

module.exports = { placeBet: placeBet }
