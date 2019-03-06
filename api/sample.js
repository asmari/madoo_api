const schema = require('../schema/sampleSchema');
const sampleController = require('../controller/sampleController');

async function routes(fastify, options) {
    fastify.get('/', schema.sampleSchema, sampleController.getSampleMessage);

    fastify.get('/screet', sampleController.getSampleScreet)
}

module.exports = routes