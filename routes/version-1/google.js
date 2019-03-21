
const googleSchema = require("../../schema/googleAuthSchema")
const googleController = require("../../controller/version-1/googleAuthController")

async function routes(fastify, options){

    // check sms otp google
    fastify.post("/otp", googleSchema.googleOtpSchema, googleController.doCheckOtp)

    // login google
    fastify.post("/login", googleSchema.googleLoginSchema, googleController.doLoginGoogle)

    // register google oauth data
    fastify.post("/register", googleSchema.googleRegisterSchema, googleController.doRegisterGoogle)

    // save member google oauth data
    fastify.post("/register/save", googleSchema.googleSaveMemberSchema, googleController.doSaveMember)
}


module.exports = routes