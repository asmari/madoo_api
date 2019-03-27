async function routes(fastify, options) {
	fastify.get('/', { schema: { hide: true } }, async (request, reply) => reply.code(200).send({ hello: 'fuad' }));

	fastify.register(require('./version-1/sample'), { prefix: '/sample' });

	fastify.register(require('./version-1/auth'), { prefix: '/auth' });

	fastify.register(require('./version-1/members'), { prefix: '/members' });

	fastify.register(require('./version-1/loyalty'), { prefix: '/loyalty' });

	fastify.register(require('./version-1/promo'), { prefix: '/promo' });

	fastify.register(require('./version-1/facebook'), { prefix: '/facebook' });

	fastify.register(require('./version-1/google'), { prefix: '/google' });

	fastify.register(require('./version-1/convertion'), { prefix: '/conversion' });

	fastify.register(require('./version-1/masterRoute'), { prefix: '/master' });

	fastify.register(require('./version-1/notification'), { prefix: '/notification' });
}

module.exports = routes;
