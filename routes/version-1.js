async function routes(fastify, options) {
    fastify.get('/', async function(request, reply) {
        return reply.code(200).send({ hello: 'fuad' });
    });

    fastify.register(require('./version-1/sample'), { prefix: '/sample' })

    fastify.register(require('./version-1/auth'), { prefix: '/auth' })

    fastify.register(require('./version-1/members'), { prefix: '/members' })

    fastify.register(require("./version-1/loyalty"), { prefix: '/loyalty' })

    fastify.register(require("./version-1/promo"), { prefix: '/promo' })
}

module.exports = routes