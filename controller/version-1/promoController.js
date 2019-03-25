const helper = require("../../helper")
const model = require("../../models")
const moment = require("moment")
const sequelize = require("sequelize")
const Op = sequelize.Op


const Loyalty = model.Loyalty.Get
const Promo = model.Promo.Get
// get random promo
exports.getRandomPromo = async (request, reply) => {
    try{

        const currentDate= moment().format('YYYY-MM-DD');

        Promo.findAll({
            where:{"valid_until": {
                    [Op.gte]: currentDate
                }},
            include: [Loyalty], limit: 10 ,
            order: sequelize.literal('rand()')})
            .then(promos=>{
                return reply.code(200).send(helper.Success(promos))
            });


    }catch(err){
        reply.send(helper.Fail(err))
    }
}
// get list promo
exports.getPromo = async (request, reply) => {
    try{

        const currentDate= moment().format('YYYY-MM-DD');
        const whereLoyalty = {};
        const whereCondition = {};

        // return reply.code(200).send(helper.Success(request.query.filter))
        const params = {
            page: parseInt(request.query.page) || 1,
            item: parseInt(request.query.item) || 10,
            search : request.query.search || null,
            sort : request.query.sort || null,
            filter: request.query.filter || [],
            total:0
        }
        let orderLoyalty = [
            "id", "ASC"
        ]
        if(typeof(params.filter) != "string" && params.filter.length > 0){

            let loyaltyId = params.filter.map((value) => {
                return parseInt(value)
            })

            whereLoyalty["id"] = {
                [Op.in]: loyaltyId
            }
        }else if(typeof params.filter != "undefined"){

            if(!isNaN(parseInt(params.filter))){
                whereLoyalty["id"] = {
                    [Op.in]: [parseInt(params.filter)]
                }
            }
        }
        whereCondition["valid_until"]={[Op.gte]:currentDate};

        if(params.search != null && typeof(params.search) == "string"){

            whereCondition[Op.or]={
                "title": {
                    [Op.like]: "%" + params.search + "%"
                },
                "$loyalty.name$":{
                    [Op.like]: "%" + params.search + "%"
                },
            }
        }

        const dataOptions = {
            page:params.page,
            paginate:params.item,
            where:whereCondition,
            order:[
                orderLoyalty
            ],
            include:[{
                model:Loyalty, as: 'loyalty',
                required: true
            }]
        }

        const promos = await  Promo.findAndCountAll(dataOptions)
        let data = promos.rows;
        // reply.send(helper.Success(promos))
        reply.send(helper.Paginate({
            item:params.item,
            pages:params.page,
            total:promos.count
        }, data))


    }catch(err){
        reply.send(helper.Fail(err))
    }
}
//get detail promo
exports.getDetailPromo = async (request, reply) => {

    try{

        const query = JSON.parse(JSON.stringify(request.query))

        const promo = await Promo.findOne({
            where:{
                id:query.promo_id
            },
            include:[Loyalty]
        })


        reply.send(helper.Success(promo))

    }catch(err){
        reply.send(helper.Fail(err))
    }

}