const model = require('../../models');
const helper = require('../../helper');
const bcrypt = require('bcrypt');

const conn = require('../../models/conn/sequelize');
const sequelize = conn.sequelize;

const Members = model.Members.Get;
const Pins = model.Pins.Get;

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