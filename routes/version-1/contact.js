const contactController = require('../../controller/version-1/contactController');
const staticSchema = require('../../schema/staticContent');

async function routes(fastify) {
	// list contact
	fastify.get('/list', staticSchema.contactSchema, contactController.getContact);
}

module.exports = routes;
