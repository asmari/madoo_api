const loyaltyControllerv2 = require('../../controller/version-2/loyaltyController');
const loyaltySchemav2 = require('../../schema/version-2/loyaltySchema');

async function routes(fastify) {
	fastify.get('/list', {
		...loyaltySchemav2.loyaltyListSchema,
		beforeHandler: [fastify.authenticate],
	}, loyaltyControllerv2.doGetListLoyalty);

	fastify.get('/list/type', {
		...loyaltySchemav2.loyaltyListTypeSchema,
		beforeHandler: [fastify.authenticate],
	}, loyaltyControllerv2.doGetListTypeLoyalty);
}

module.exports = routes;
