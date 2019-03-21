const authController = require("../../controller/version-1/authController")
const googleAuthController  = require("../../controller/version-1/googleAuthController")
const facebookAuthController = require("../../controller/version-1/facebookAuthController")

const authSchema = require("../../schema/authSchema")
const googleAuthSchema = require("../../schema/googleAuthSchema")
const facebookAuthSchema = require("../../schema/facebookAuthSchema")

async function routes(fastify, options) {
    // get members
    fastify.get('/', { schema: {hide: true}}, authController.authIndex)

    // login members
    fastify.post('/login',authSchema.authLoginSchema, authController.doLogin)

    // check member
    fastify.post("/check", authSchema.authCheckSchema, authController.doCheckMember)
}

module.exports = routes