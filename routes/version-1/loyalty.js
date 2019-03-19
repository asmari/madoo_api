const loyaltySchema = require("../../schema/loyaltySchema")
const loyaltyController  = require("../../controller/version-1/loyaltyController")


async function routes (fastify, options) {


    //list member
    fastify.get("/list/member", {
        ...loyaltySchema,
        beforeHandler:[fastify.authenticate]
    }, loyaltyController.getLoyaltyMember)

    
}

module.exports = routes