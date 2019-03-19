const helper = require("../../helper")
const model = require("../../models")
const sequelize = require("sequelize")
const Op = sequelize.Op


const Loyalty = model.Loyalty.Get
const Promo = model.Promo.Get

exports.getRandomPromo = async (request, reply) => {
    try{

        Promo.findAll({ include: [Loyalty], limit: 10 ,order: sequelize.literal('rand()')}).then(promos=>{
            return reply.code(200).send(helper.Success(promos))
        });


    }catch(err){
        reply.send(helper.Fail(err))
    }
}