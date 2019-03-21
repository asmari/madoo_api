const googleAuthController = require("../../controller/version-1/googleAuthController")
const facebookAuthController = require("../../controller/version-1/facebookAuthController")

const googleAuthSchema = require("../../schema/googleAuthSchema")
const facebookAuthSchema = require("../../schema/facebookAuthSchema")

const memberSchema = require("../../schema/memberSchema")
const memberController = require('../../controller/version-1/memberController');
async function routes(fastify, options) {
    // get members
    fastify.get('/', memberController.memberIndex)

    // register members
    fastify.post('/register/phone',memberSchema.registerSchema, memberController.doRegisterPhone)

    // register using google oauth data
    fastify.post('/register/google', googleAuthSchema.googleRegisterSchema, googleAuthController.doRegisterGoogle)

    // OTP validation
    fastify.post('/otp/validation',memberSchema.otpSchema, memberController.doOtpValidation)

    // Save Member
    fastify.post('/register/save',memberSchema.memberSchema, memberController.doSaveMember)
}

module.exports = routes