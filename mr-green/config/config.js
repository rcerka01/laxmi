var secret = require("./secret");

module.exports = {
    app: {
        port: 3002,
        updateTimes: {
            seconds: [5, 15, 25, 35, 45, 55]
        }
    },
    mrGreen: {
        host: "raitis.co.uk",
        protocol: "http",
        port: 3001
    },
    db: {
        name: "betfair-db",
        login: secret.db.login,
        password: secret.db.password
    }
}
