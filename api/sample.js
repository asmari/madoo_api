async function routes(fastify, options) {
    fastify.get('/', async (request, reply) => {
        reply.code(200).send({ hello: 'guest' })
    })

    fastify.get('/screet', async (request, reply) => {
        request.jwtVerify(function (err, decoded) {
            return reply.code(200).send(err || { hello: 'fuad' })
        })
    })
}

module.exports = routes