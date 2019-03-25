const promoController  = require("../../controller/version-1/promoController")
const promoSchema = require("../../schema/promoSchema")

async function routes (fastify, options) {


    //list random promo
    fastify.get("/list/random", promoSchema.promoListSchema, promoController.getRandomPromo)


}

module.exports = routes