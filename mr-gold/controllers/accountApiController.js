var conf = require("../config/config");
var request = require("request");

var urlAccount = "https://api.betfair.com/exchange/account/rest/v1.0/getAccountDetails/";
var urlFunds = "https://api.betfair.com/exchange/account/rest/v1.0/getAccountFunds/";
var urlCurrency = "https://api.betfair.com/exchange/account/rest/v1.0/listCurrencyRates/";

function options(url, token) {
    return {
        url: url,
        headers: {
            'Content-Type': "application/json",
            "Accept": "text/json",
            'X-Application': conf.user.apiKey,
            'X-Authentication': token }
        }
};

module.exports = function(app, token) {
    var utilities = require("./utilities");    
    
    // ****************************************************
    // * GET account details
    // ****************************************************
    app.get("/api/getAccountDetails", function(req, res) {
 
        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {

                var jsonRes = JSON.parse(response.body);

                var output = {
                    currency_code: jsonRes.currencyCode,
                    first_name: jsonRes.firstName,
                    last_name: jsonRes.lastName,
                    local_code: jsonRes.localeCode,
                    region: jsonRes.region,
                    timezone: jsonRes.timezone,
                    discount_rate: jsonRes.discountRate,
                    points_code: jsonRes.pointsBalance,
                    country_code: jsonRes.countryCode
                }

                res.json(output);

            } else if (response.statusCode == 400) { 
                utilities.recoverFromUnauthorisedRequest(app, req, res) 
             } else {
                console.log("Unexpected error from " + req.url +", " + error)
                res.json([]);
             }
        }

        request(options(urlAccount, token), callback);
    });

    // ****************************************************
    // * GET Currencies exchange rate
    // ****************************************************
    app.get("/api/listCurrencies", function(req, res) {
 
        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {

                var jsonRes = JSON.parse(response.body);
                var output = [];

                jsonRes.map(item => 
                    output.push({
                        currency_code: item.currencyCode,   
                        rate: Number((item.rate).toFixed(3))
                    })
                );

                res.json(output);

            } else if (response.statusCode == 400) { 
                utilities.recoverFromUnauthorisedRequest(app, req, res) 
             } else {
                console.log("Unexpected error from " + req.url +", " + error)
                res.json([]);
             }
        }

        request.post(options(urlCurrency, token), callback);
    });

    // ****************************************************
    // * GET account ballance
    // ****************************************************
    app.get("/api/getFunds", function(req, res) {
 
        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {

                var jsonRes = JSON.parse(response.body);
                var output = {
                        available_to_bet: jsonRes.availableToBetBalance,   
                        commision: jsonRes.retainedCommission,
                        exposure: jsonRes.exposure,   
                        exposure_limit: jsonRes.exposureLimit,
                        discount: jsonRes.discountRate,   
                        points: jsonRes.pointsBalance
                    }

                res.json(output);

            } else if (response.statusCode == 400) { 
                utilities.recoverFromUnauthorisedRequest(app, req, res) 
             } else {
                console.log("Unexpected error from " + req.url +", " + error)
                res.json([]);
             }
        }

        request.post(options(urlFunds, token), callback);
    });
}
