var secret = require("./secret");

var test = {
    app: {
        live: false, 
        port: 3002,
        updateTimes: {
            seconds: [3, 13, 23, 33, 43, 53]
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
        domain: "@ds123796.mlab.com:23796/",
        name: "betfairtestdb",
        login: secret.testDb.login,
        password: secret.testDb.password
    },
    soccer: {
        bid: 5,
        elapsedTime: 80,
        scoreHigher: 2,
        version: "test"
    }
}

var live = {
    app: {
        live: true, 
        port: 3002,
        updateTimes: {
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
        domain: "@ds143774.mlab.com:43774/",
        name: "betfair-db",
        login: secret.db.login,
        password: secret.db.password
    },
    soccer: {
        bid: 5,
        elapsedTime: 80,
        scoreHigher: 2,
        version: "v1.4"
    }
}

module.exports = live;