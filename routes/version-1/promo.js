const promoController  = require("../../controller/version-1/promoController")
const promoListschema  = require("../../schema/promoSchema")


async function routes (fastify, options) {


    //list random promo
    fastify.get("/list/random", promoController.getRandomPromo)
    //list promo
    fastify.get("/list",{
        ...promoListschema.promoListSchema,
        beforeHandler:[fastify.authenticate]
    }, promoController.getPromo)


}

module.exports = routes