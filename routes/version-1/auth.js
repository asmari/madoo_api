const authController = require("../../controller/version-1/authController")

async function routes(fastify, options) {
    // get members
    fastify.get('/', authController.authIndex)

    // login members
    fastify.post('/login', authController.doLogin)
}

module.exports = routes