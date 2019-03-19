const promoController  = require("../../controller/version-1/promoController")


async function routes (fastify, options) {


    //list random promo
    fastify.get("/list/random", promoController.getRandomPromo)


}

module.exports = routes