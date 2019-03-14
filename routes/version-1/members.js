const memberController = require('../../controller/version-1/memberController');


const googleAuthController = require("../../controller/version-1/googleAuthController")
const facebookAuthController = require("../../controller/version-1/facebookAuthController")

const googleAuthSchema = require("../../schema/googleAuthSchema")
const facebookAuthSchema = require("../../schema/facebookAuthSchema")

const registerSchema = require("../../schema/registerSchema")
const memberController = require('../../controller/version-1/memberController');
async function routes(fastify, options) {
    // get members
    fastify.get('/', memberController.memberIndex)

    // register members
    fastify.post('/register',registerSchema.registerSchema, memberController.doRegisterPhone)

    // register using google oauth data
    fastify.post('/register/google', googleAuthSchema.googleRegisterSchema, googleAuthController.doRegisterGoogle)

    // register using facebook oauth data
    fastify.post("/register/facebook", facebookAuthSchema.facebookRegisterSchema, facebookAuthController.doRegisterFacebook)
}

module.exports = routes