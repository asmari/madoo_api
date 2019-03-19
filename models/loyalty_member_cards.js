const Sequelize = require('sequelize');
const connet = require('./conn/sequelize');
const sequelizePaginate = require("sequelize-paginate")
const model = connet.sequelize;

const Loyalty = require("./loyalty")
const MemberCards = require("./member_cards")

const LoyaltyMemberCards = model.define("loyalty_has_member_cards", {
    loyalty_id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        unique:true
    },
    member_cards_id:{
        type:Sequelize.INTEGER,
        references: {
            model: MemberCards.Get,
            key: "id"
        }
    }
},{
    timestamps: true,
    paranoid: true,
    deletedAt: "deleted_at",
    underscored: true
})

LoyaltyMemberCards.hasOne(Loyalty.Get, { foreignKey: "id" })

// LoyaltyMemberCards.hasOne(MemberCards.Get, {
//     foreignKey:"id",
//     sourceKey:"member_cards_id"
// })

sequelizePaginate.paginate(LoyaltyMemberCards)

exports.Get = LoyaltyMemberCards

