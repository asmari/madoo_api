const helper = require("../../helper")
const model = require("../../models")
const sequelize = require("sequelize")
const Op = sequelize.Op


const Loyalty = model.Loyalty.Get
const LoyaltyMemberCards = model.LoyaltyMemberCards.Get
const MemberCards = model.MembersCards.Get
const Promo = model.Promo.Get

//Get Detail Member Card with loyalty
exports.getDetailMember = async (request, reply) => {

    try{

        const params = JSON.parse(JSON.stringify(request.query)) || {}
        const user = request.user

        console.log(params)

        if(request.validationError){
            throw(request.validationError)
        }

        if(!params.hasOwnProperty("loyalty_id")){
            throw({
                message:"Field loyalty_id not found"
            })
        }

        MemberCards.findOne({
            where:{
                members_id:user.id
            },
            include:[{
                model:LoyaltyMemberCards,
                
                include:[{
                    model:Loyalty,
                    required:true,
                    where:{
                        id:params.loyalty_id
                    }
                }]
            }]
        })
        .then( async (memberCards) => {
            if(memberCards != null){

                let loyaltyCards = memberCards.loyalty_has_member_cards[0];

                if(loyaltyCards != null){
                    let loyalty = loyaltyCards.loyalty

                    if(loyalty != null){
                        let promo = await Promo.findAll({
                            raw:true,
                            where:{
                                loyalty_id:loyalty.id
                            }
                        })

                        if(promo != null){
                            loyalty.dataValues.promo = promo;
                        }else{
                            loyalty.dataValues.promo = [];
                        }

                        loyaltyCards.dataValues.loyalty = loyalty
                        memberCards.loyalty_has_member_cards[0] = loyaltyCards  
                    }
                }

                reply.send(helper.Success(memberCards))
            }else{
                reply.send(helper.Fail({
                    message:"Member cards with loyalty not found!",
                    statusCode:404
                }))
            }
            
        })
        .catch((err) => {
            reply.send(helper.Fail(err))
        })

    }catch(err){
        reply.send(helper.Fail(err))
    }
    
}

//List Detail Member Card
exports.getLoyaltyMember = async (request, reply) => {
    try{

        const user = request.user

        const params = {
            page: parseInt(request.query.page) || 1,
            item: parseInt(request.query.item) || 5,
            search : request.query.search || null,
            sort : request.query.sort || null,
            filter: request.query.filter || [],
            total:0
        }

        console.log(request.query)

        let orderLoyalty = [
            "id", "ASC"
        ]

        let orderCards = [
            "id","ASC"   
        ]

        if(params.sort != null && typeof(params.sort) == "string"){
            switch(params.sort){
                case "alphabet":
                    orderLoyalty = [Loyalty, "name", "ASC"]
                break;

                case "point_low":
                    orderCards = ["point", "ASC"]
                break;

                case "point_high":
                    orderCards = ["point", "DESC"]
                break;
            }
        }

        MemberCards.findAll({
            where:{
                members_id:user.id
            },
            order:[
                orderCards
            ],
            include:[LoyaltyMemberCards]
        })
        .then((cards) => {

            const cardsId = cards.map((value) => {
                return value.id
            })

            const whereLoyalty = {};

            if(orderCards.length > 0 && orderCards[0] == "point"){
                orderLoyalty = sequelize.literal("FIELD(member_cards_id, " + cardsId.join(",") + ") ASC")
            }

            if(typeof(params.filter) != "string" && params.filter.length > 0){
                
                let loyaltyId = params.filter.map((value) => {
                    console.log(value)
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
                    member_cards_id:{
                        [Op.in]:cardsId
                    }
                },
                order:[
                    orderLoyalty
                ],
                include:[{
                    model:Loyalty,
                    where:whereLoyalty
                }]
            }

            // return LoyaltyMemberCards.findAll(dataOptions)
            // .then((number) => {
                
            //     let count = 0

            //     number.forEach((value) => {
            //         value.loyalty.forEach((val) => {
            //             count += 1
            //         })
            //     })

            //     console.log(count)

                return LoyaltyMemberCards.paginate(dataOptions)
            // })

        })
        .then((loyaltyCards) => {

            let data = loyaltyCards.docs.map((value) => {
                return value.loyalty
            })

            reply.send(helper.Paginate({
                item:params.item,
                pages:params.page,
                // total:count
            }, data))
            
            
        })
        .catch((err) => {
            reply.send(helper.Fail(err))
        })


    }catch(err){
        reply.send(helper.Fail(err))
    }
} 