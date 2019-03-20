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
exports.getPromo = async (request, reply) => {
    try{

        const currentDate= moment().format('YYYY-MM-DD');
        const whereLoyalty = {};
        const whereSearch = {};

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

        if(params.search != null && typeof(params.search) == "string"){
            whereLoyalty["name"] = {
                [Op.like]: "%" + params.search + "%"
            }
        }
        const dataOptions = {
            page:params.page,
            paginate:params.item,
            where:{
                "valid_until": {
                    [Op.gte]: currentDate
                },[Op.or]: {
                    "title": {
                        [Op.like]: "%" + params.search + "%"
                    }
                }

            },
            order:[
                orderLoyalty
            ],
            include:[{
                model:Loyalty, as: 'loyalty',
                where:{[Op.or]:{"name":{[Op.like]: "%" + params.search + "%"}}}
            }]
        }
        Promo.paginate(dataOptions)
            .then(promos=>{
                reply.send(helper.Paginate({
                    item:params.item,
                    pages:params.page,
                    // total:count
                }, promos))
            });


    }catch(err){
        reply.send(helper.Fail(err))
    }
}