const helper = require("../../helper")
const model = require("../../models")
const sequelize = require("sequelize")
const Op = sequelize.Op


const Loyalty = model.Loyalty.Get
const LoyaltyMemberCards = model.LoyaltyMemberCards.Get
const LoyaltyType = model.LoyaltyType.Get
const MemberCards = model.MembersCards.Get
const Promo = model.Promo.Get

//Delete Membercard loyalty
exports.doDeleteLoyaltyMemberCard = async (request, reply) => {
    try{

        const user = request.user
        const params = request.body || {};

        if(!params.hasOwnProperty("member_cards_id")){
            throw({
                message:"Field member_cards_id is required"
            })
        }

        let memberCard = await MemberCards.findOne({
            where:{
                members_id:user.id,
                id:params.member_cards_id
            },
            include:[LoyaltyMemberCards]
        })

        if(memberCard != null){
            memberCard.destroy();
            reply.send(helper.Success({
                delete:true
            }))
        }

        reply.send(helper.Success({
            delete:false
        }))

    }catch(err){
        reply.send(helper.Fail(err))
    }
}

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
            ]
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
                    where:whereLoyalty,
                },{
                    model:MemberCards
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
        .then(async (loyaltyCards) => {

            let data = loyaltyCards.docs

            reply.send(helper.Paginate({
                item:params.item,
                pages:params.page,
                total:loyaltyCards.total
            }, data))
            
            
        })
        .catch((err) => {
            reply.send(helper.Fail(err))
        })


    }catch(err){
        reply.send(helper.Fail(err))
    }
} 

//list loyalty
exports.getListLoyalty = async (request, reply) => {
    try{

        let data = await LoyaltyType.findAll({
            order:[
                ["id", "ASC"]
            ],
            include:[Loyalty]
        })

        reply.send(helper.Success(data))

    }catch(err){
        reply.send(helper.Fail(err))
    }
}

//get detail loyalty
exports.getDetailLoyalty = async (request, reply) => {

    try{

        const query = JSON.parse(JSON.stringify(request.query))

        const loyalty = await Loyalty.findOne({
            where:{
                id:query.loyalty_id
            },
            include:[Promo]
        })
        

        reply.send(helper.Success(loyalty))

    }catch(err){
        reply.send(helper.Fail(err))
    }

}