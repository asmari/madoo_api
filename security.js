const fp = require("fastify-plugin")

module.exports = fp(async (fastify, options) => {

    fastify.register(require("fastify-jwt"), {
        secret:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    })

    fastify.decorate("authenticate", async (request, reply) => {

        try{
            await request.jwtVerify()
        }catch(err){
            reply.send(err)
        }

    })

})
