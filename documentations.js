const fp = require('fastify-plugin');
const foas = require('fastify-oas');

const config = require('./config');

module.exports = fp(async (fastify) => {
	fastify.register(foas, {
		routePrefix: '/docs',
		exposeRoute: true,
		swagger: {
			info: {
				title: 'Husky Rest API Swagger',
				description: 'Documentations for Husky',
				version: '1.0.0',
			},
			host: process.env.BASE_URL || `localhost:${config.get.serverPort}`,
			schemes: ['http'],
			consumes: ['application/json'],
			produces: ['application/json'],
			securityDefinitions: {
				BearerAuth: {
					type: 'http',
					scheme: 'bearer',
				},
				apiKey: {
					type: 'apiKey',
					name: 'apiKey',
					in: 'header',
				},
			},
		},
	});
});
