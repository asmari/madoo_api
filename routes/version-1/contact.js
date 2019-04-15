const contactController = require('../../controller/version-1/contactController');


async function routes(fastify) {
	// list contact
	fastify.get('/list', contactController.getContact);
}

module.exports = routes;
