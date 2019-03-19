const Sequelize = require("sequelize")
const connect = require("./conn/sequelize")
const sequelizePaginate = require("sequelize-paginate")
const model = connect.sequelize

const Members = require("./members")
const LoyaltyMemberCards = require("./loyalty_member_cards")

const MemberCards = model.define('member_cards',{
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        references:{
            model:LoyaltyMemberCards.Get,
            key:"member_cards_id"
        }
    },
    members_id: {
        type:Sequelize.INTEGER,
        allowNull:false,
        references: {
            model: Members.Get,
            key: "id"
        },
        validate:{
            notEmpty:{
                msg:"Members Id is required"
            }
        }
    },
    member_type:{
        type:Sequelize.STRING,
        allowNull:false,
        validate:{
            notEmpty:{
                msg:"Member Type"
            }
        }
    },
    card_number:{
        type:Sequelize.STRING,
        allowNull:true
    },
    full_name:{
        type:Sequelize.STRING,
        allowNull:true
    },
    email:{
        type:Sequelize.STRING,
        allowNull:true
    },
    mobile_number:{
        type:Sequelize.STRING,
        allowNull:true
    },
    date_birth:{
        type:Sequelize.DATE,
        allowNull:false
    },
    member_level:{
        type:Sequelize.STRING,
        allowNull:true
    },
    cvv:{
        type:Sequelize.STRING,
        allowNull:true
    },
    signup_date:{
        type:Sequelize.DATE,
        allowNull:false
    },
    expiry_date:{
        type:Sequelize.DATE,
        allowNull:false
    },
    point:{
        type:Sequelize.INTEGER,
        allowNull:false
    }
},{
    timestamps:true,
    underscored: true,
    deletedAt: 'deleted_at',
    paranoid: true
})

// MemberCards.hasOne(Members.Get, {foreignKey: "id"})
MemberCards.hasMany(LoyaltyMemberCards.Get, {
    foreignKey: "member_cards_id",
    sourceKey: "id"
})

sequelizePaginate.paginate(MemberCards)

exports.Get = MemberCards