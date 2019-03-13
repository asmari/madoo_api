const authController = require("../../controller/version-1/authController")
const googleAuthController  = require("../../controller/version-1/googleAuthController")

const authSchema = require("../../schema/authSchema")
const googleAuthSchema = require("../../schema/googleAuthSchema")

async function routes(fastify, options) {
    // get members
    fastify.get('/', authController.authIndex)

    // login members
    fastify.post('/login',authSchema.authLoginSchema, authController.doLogin)

    // check member
    fastify.post("/check", authSchema.authCheckSchema, authController.doCheckMember)

    // check login data from google oauth
    fastify.post("/google", googleAuthSchema.googleLoginSchema, googleAuthController.doLoginGoogle)
}

module.exports = routes