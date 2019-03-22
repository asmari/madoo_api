const memberSchema = require("../../schema/memberSchema")
const memberController = require('../../controller/version-1/memberController');
async function routes(fastify, options) {
    // get members
    fastify.get('/', memberController.memberIndex)

    // register members
    fastify.post('/register/phone',memberSchema.registerSchema, memberController.doRegisterPhone)

    // OTP validation
    fastify.post('/otp/validation',memberSchema.otpSchema, memberController.doOtpValidation)

    // Save Member
    fastify.post('/register/save',memberSchema.memberSchema, memberController.doSaveMember)
}

module.exports = routes