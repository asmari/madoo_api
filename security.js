const fp = require('fastify-plugin');
const fastifyJWT = require('fastify-jwt');

module.exports = fp(async (fastify) => {
	fastify.register(fastifyJWT, {
		secret: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
		sign: {
			expiresIn: '30d',
		},
	});

	fastify.decorate('authenticate', async (request, reply) => {
		try {
			await request.jwtVerify();
		} catch (err) {
			reply.send(err);
		}
	});
});
