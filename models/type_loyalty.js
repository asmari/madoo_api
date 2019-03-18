const Sequelize = require("sequelize")
const connect = require("./conn/sequelize")
const model = connect.sequelize

const Loyalty = require("./loyalty")

const LoyaltyType = model.define("type_loyalty",{
    id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        references: {
            model: Loyalty.Get,
            key: "type_loyalty_id"
        }
    },
    title:{
        type:Sequelize.STRING,
        allowNull:false
    }
},{
    timestamps:true,
    underscored: true,
    deletedAt: "deleted_at",
    paranoid: true
})


exports.Get = LoyaltyType