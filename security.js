const fp = require('fastify-plugin');
const fastifyJWT = require('fastify-jwt');
const { ErrorResponse } = require('./helper/response/index');
const MembersToken = require('./models').MembersToken.Get;

module.exports = fp(async (fastify) => {
	fastify.register(fastifyJWT, {
		secret: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
		sign: {
			// expiresIn: '30d',
		},
	});

	fastify.decorate('authenticate', async (request, reply) => {
		if (Object.prototype.hasOwnProperty.call(request.headers, 'authorization')) {
			const token = request.headers.authorization.replace('Bearer', '').trim();

			const membersToken = await MembersToken.findOne({
				where: {
					token,
				},
				paranoid: false,
			});

			if (membersToken === null) {
				reply.send(new ErrorResponse(40117));
				return;
			}

			if (membersToken !== null && membersToken.deleted_at !== null) {
				reply.send(new ErrorResponse(40112));
				return;
			}
		}

		try {
			await request.jwtVerify();
		} catch (err) {
			// reply.send(err);
			reply.send(new ErrorResponse(40100));
		}
	});
});
