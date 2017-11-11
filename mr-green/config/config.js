var secret = require("./secret");

module.exports = {
    app: {
        port: 3002,
        updateTimes: {
            // seconds: [3, 13, 23, 33, 43, 53]
            seconds: [5]
        }
    },
    mrGreen: {
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
        elapsedTime: 70,
        scoreHigher: 2
    }
}
