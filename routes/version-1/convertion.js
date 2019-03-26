const convertionController = require("../../controller/version-1/convertionController")
const convertionSchema = require("../../schema/convertionSchema")

module.exports = async (fastify, options) => {

    fastify.get("/check", {
        ...convertionSchema.checkConvertion,
        beforeHandler:[fastify.authenticate]
    }, convertionController.checkConvertionRate)

    // fastify.post("/convert",{
    //     beforeHandler:[fastify.authenticate]
    // }, convertionController.doConvertionPoint)

}

