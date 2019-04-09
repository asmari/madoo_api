const transactionController = require('../../controller/version-1/transactionController');
const transactionSchema = require('../../schema/transactionSchema');

async function routes(fastify) {
	fastify.get('/history', {
		...transactionSchema.transactionListSchema,
		beforeHandler: [fastify.authenticate],
	}, transactionController.doGetListHistory);
}

module.exports = routes;
