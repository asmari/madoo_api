const authController = require("../../controller/version-1/authController")
const authSchema = require("../../schema/authSchema")

async function routes(fastify, options) {
    // get members
    fastify.get('/', authController.authIndex)

    // login members
    fastify.post('/login',authSchema.authLoginSchema, authController.doLogin)

    // check member
    fastify.post("/check", authSchema.authCheckSchema, authController.doCheckMember)
}

module.exports = routes