var secret = require("./secret");

module.exports = {
    app: {
        protocol: "http",
        port: "3001",
        maxReloadToken: 5
    },
    user: {
        apiKey: secret.apiKey,
        username: "cerkar01",                         
        password: secret.password,
        cert: {
            private: "client-2048.key",
            public: "client-2048.crt",
            passphrase: secret.passphrase
        }
    }
}
