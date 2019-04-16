const aboutController = require('../../controller/version-1/aboutController');
const staticSchema = require('../../schema/staticContent');


async function routes(fastify) {
	// list about
	fastify.get('/', staticSchema.aboutSchema, aboutController.getAbout);
}

module.exports = routes;
