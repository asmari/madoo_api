const helper = require("../../helper")
const model = require("../../models")

const ConvertionRate = model.ConvertionRate.Get
const Loyalty = model.Loyalty.Get

exports.checkConvertionRate = async (request, reply) => {
    try{

        const params = JSON.parse(JSON.stringify(request.query))
        
        let rate = await ConvertionRate.findOne({
            where:{
                loyalty_id:params.loyalty_id_source,
                conversion_loyalty:params.loyalty_id_target
            }
        })

        if(rate){

            const point = params.point_to_convert

            let source = await Loyalty.findOne({
                where:{
                    id:params.loyalty_id_source
                }
            })

            if(point % source.multiple != 0){
                throw({
                    message:`Point not multiply by ${source.multiple}`,
                    statusCode:500       
                })
            }

            if(point < source.min_convertion){
                throw({
                    message:`Point is less than ${source.min_convertion}`
                })
            }

            const new_point = point * rate.point_conversion;

            return reply.send(helper.Success({
                ...params,
                point_converted:new_point
            }))

        }

        throw({
            message:"Conversion Rate not found",
            statusCode:404
        })

    }catch(err){
        reply.send(helper.Fail(err))
    }
}


exports.doConvertionPoint = async (request, reply) => {

}