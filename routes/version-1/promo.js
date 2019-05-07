const promoController = require('../../controller/version-1/promoController');
const promoListschema = require('../../schema/promoSchema');

async function routes(fastify) {
	// list random promo
	fastify.get('/list/featured', {
		...promoListschema.promoFeaturedSchema,
		beforeHandler: [fastify.authenticate],
	}, promoController.getFeaturedPromo);

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

	// autocomplete promos
	fastify.get('/autocomplete', {
		...promoListschema.promoAutoCompleteSchema,
		beforeHandler: [fastify.authenticate],
	}, promoController.getAutoCompletePromo);
}

module.exports = routes;
