const fp = require("fastify-plugin")
const config = require("./config")

module.exports = fp(async (fastify, options) => {
    
    fastify.register(require("fastify-oas"), {
        routePrefix:"/docs",
        exposeRoute:true,
        swagger:{
            info:{
                title: "Husky Swagger",
                description : "Documentations for Husky",
                version: "1.0.0"
            },
            host:"localhost:" + config.get.serverPort,
            schemes:["http"],
            consumes:["application/json"],
            produces:["application/json"],
            securityDefinitions: {
                BearerAuth: {
                  type: 'http',
                  scheme: 'bearer'
                },
                apiKey: {
                    type: 'apiKey',
                    name: 'apiKey',
                    in: 'header'
                }
              }
        }
    })

})