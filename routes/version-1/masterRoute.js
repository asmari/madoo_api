const masterController = require('../../controller/version-1/masterFilterController');
const masterSchema = require('../../schema/masterSchema');

module.exports = async (fastify) => {
	fastify.get('/filter/card', {
		...masterSchema.listCard,
		beforeHandler: [fastify.authenticate],
	}, masterController.getFilterListCard);


	fastify.get('/sort/card', {
		schema: {
			security: [
				{
					BearerAuth: [],
				},
			],
		},
		beforeHandler: [fastify.authenticate],
	}, masterController.getSortListCard);


	fastify.get('/filter/promo', {
		schema: {
			security: [
				{
					BearerAuth: [],
				},
			],
		},
		beforeHandler: [fastify.authenticate],
	}, masterController.getFilterListPromo);
};
