var secret = require("./secret");

module.exports = {
    app: {
        port: 3002,
        updateTimes: {
            //seconds: [3, 13, 23, 33, 43, 53]
            seconds: [5]
        }
    },
    mrGold: {
        host: "raitis.co.uk",
        protocol: "http",
        port: 3001
    },
    vishnu: {
        host: "raitis.co.uk",
        protocol: "http",
        port: 3003
    },
    db: {
        name: "betfair-db",
        login: secret.db.login,
        password: secret.db.password
    },
    soccer: {
        bid: 2,
        elapsedTime: 80,
        scoreHigher: 2
    }
}
