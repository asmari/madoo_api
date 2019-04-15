const aboutController = require('../../controller/version-1/aboutController');


async function routes(fastify) {
	// list about
	fastify.get('/list', aboutController.getAbout);
}

module.exports = routes;
