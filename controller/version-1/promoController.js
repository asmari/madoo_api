const helper = require("../../helper")
const model = require("../../models")
const moment = require("moment")
const sequelize = require("sequelize")
const Op = sequelize.Op


const Loyalty = model.Loyalty.Get
const Promo = model.Promo.Get

exports.getRandomPromo = async (request, reply) => {
    try{

        const currentDate= moment().format('YYYY-MM-DD');
        // return reply.code(200).send(helper.Success(currentDate))
        Promo.findAll({where:sequelize.where(sequelize.fn('date', sequelize.col('valid_until')), '>=', currentDate),
            include: [Loyalty], limit: 10 ,
            order: sequelize.literal('rand()')})
            .then(promos=>{
            return reply.code(200).send(helper.Success(promos))
        });


    }catch(err){
        reply.send(helper.Fail(err))
    }
}