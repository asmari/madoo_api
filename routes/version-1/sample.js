const schema = require('../../schema/sampleSchema');
const sampleController = require('../../controller/version-1/sampleController');

async function routes(fastify, options) {
    fastify.get('/', schema.sampleSchema, sampleController.getSampleMessage);

    fastify.get('/screet', { schema: {hide: true}}, sampleController.getSampleScreet)
}

module.exports = routes