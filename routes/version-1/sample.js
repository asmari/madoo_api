const schema = require('../../schema/sampleSchema');
const sampleController = require('../../controller/version-1/sampleController');

async function routes(fastify) {
	fastify.get('/', schema.sampleSchema, sampleController.getSampleMessage);

	fastify.get('/screet', { schema: { hide: true } }, sampleController.getSampleScreet);

	fastify.get('/code/response', sampleController.getCodeResponse);
}

module.exports = routes;
