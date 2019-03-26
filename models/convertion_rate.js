const sequelize = require("sequelize")
const connect = require("./conn/sequelize")
const model = connect.sequelize

const Loyalty = require("./loyalty").Get

const ConvertionRate = model.define("conversion_rate",{
    loyalty_id:{
        type:sequelize.INTEGER,
        allowNull:false,
        max:10
    },
    conversion_loyalty:{
        type:sequelize.INTEGER,
        allowNull:false,
        max:10
    
    },
    point_loyalty:{
        type:sequelize.DOUBLE,
        allowNull:false
    },
    point_conversion:{
        type:sequelize.DOUBLE,
        allowNull:false
    }
},{
    timestamps:true,
    deletedAt:"deleted_at",
    paranoid:true,
    underscored:true,
    freezeTableName:true,
    tableName:"conversion_rate"
})

Loyalty.belongsTo(ConvertionRate, {
    foreignKey:"id",
    targetKey:"loyalty_id",
    as:"LoyaltySource"
})

Loyalty.belongsTo(ConvertionRate, {
    foreignKey:"id",
    targetKey:"conversion_loyalty",
    as:"LoyaltyTarget"
})

exports.Get = ConvertionRate