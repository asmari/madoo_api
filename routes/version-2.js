const loyalty = require('./version-2/loyalty');

async function routes(fastify) {
	fastify.register(loyalty, { prefix: '/loyalty' });
}

module.exports = routes;
