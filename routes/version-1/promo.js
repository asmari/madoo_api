const promoController = require('../../controller/version-1/promoController');
const promoListschema = require('../../schema/promoSchema');

async function routes(fastify) {
	// list random promo
	fastify.get('/list/random', {
		...promoListschema.promoRandomSchema,
		beforeHandler: [fastify.authenticate],
	}, promoController.getRandomPromo);

	// list promo
	fastify.get('/list', {
		...promoListschema.promoListSchema,
		beforeHandler: [fastify.authenticate],
	}, promoController.getPromo);

	// detail promo
	fastify.get('/detail', {
		...promoListschema.promoDetailSchema,
		beforeHandler: [fastify.authenticate],
	}, promoController.getDetailPromo);
}

module.exports = routes;
