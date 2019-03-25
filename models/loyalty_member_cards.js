const Sequelize = require('sequelize');
const connet = require('./conn/sequelize');
const sequelizePaginate = require("sequelize-paginate")
const model = connet.sequelize;

const Loyalty = require("./loyalty")
const MemberCards = require("./member_cards")

const LoyaltyMemberCards = model.define("loyalty_has_member_cards", {
    loyalty_id:{
        type:Sequelize.INTEGER,
        // primaryKey:true,
    },
    member_cards_id:{
        type:Sequelize.INTEGER
    }
},{
    timestamps: true,
    paranoid: true,
    deletedAt: "deleted_at",
    underscored: true
})

LoyaltyMemberCards.hasMany(Loyalty.Get, { 
    foreignKey: "id",
    sourceKey:"loyalty_id",
    targetKey:"loyalty_id"
 })

LoyaltyMemberCards.hasMany(MemberCards.Get, {
    foreignKey:"id",
    sourceKey:"member_cards_id"
})

// MemberCards.Get.belongsTo(LoyaltyMemberCards,{
//     foreignKey:"id",
//     sourceKey:"member_cards_id"
// })

sequelizePaginate.paginate(LoyaltyMemberCards)

exports.Get = LoyaltyMemberCards

