const wordingController = require('../../controller/version-1/wordingController');
const wordingSchema = require('../../schema/wordingSchema');

async function routes(fastify) {
	fastify.get('/list', {
		...wordingSchema.wordingListSchema,
		beforeHandler: [fastify.authenticate],
	}, wordingController.getWordingList);
}

module.exports = routes;
