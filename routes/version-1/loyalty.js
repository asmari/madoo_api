const loyaltySchema = require("../../schema/loyaltySchema")
const loyaltyController  = require("../../controller/version-1/loyaltyController")


async function routes (fastify, options) {


    //list member
    fastify.get("/list/member", {
        ...loyaltySchema.loyaltyMemberListSchema,
        beforeHandler:[fastify.authenticate]
    }, loyaltyController.getLoyaltyMember)

    //detail member
    fastify.get("/detail/member",{
        ...loyaltySchema.loyaltyMemberDetailSchema,
        beforeHandler:[fastify.authenticate]
    }, loyaltyController.getDetailMember)

    //list loyalty with type
    fastify.get("/list",{
        ...loyaltySchema.loyaltyListSchema,
        beforeHandler:[fastify.authenticate]
    }, loyaltyController.getListLoyalty)
    
}

module.exports = routes