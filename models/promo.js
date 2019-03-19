const sequelize = require("sequelize")
const connect = require("./conn/sequelize")
const model = connect.sequelize


const Loyalty = require('./loyalty');
const Promo = model.define("promo",{
    loyalty_id:{
        type:sequelize.STRING,
        allowNull:false,
        validate:{
            notEmpty:{
                msg: "Loyalty id is required"
            }
        },
        references: {
            model: Loyalty.Get,
            key: "id"
        }
    },
    title:{
        type:sequelize.STRING,
        allowNull:false
    },
    body:{
        type:sequelize.STRING,
        allowNull:false
    },
    image:{
        type:sequelize.STRING,
        allowNull:true
    },
    valid_until:{
        type:sequelize.DATE,
        allowNull:false
    }
},{
    timestamps:true,
    underscored:true,
    deletedAt:"deleted_at",
    paranoid:true,
    freezeTableName:true,
    tableName:"promo",
})
exports.Get = Promo