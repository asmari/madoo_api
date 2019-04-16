const webhookController = require('../../controller/version-1/webhookController');

async function routes(fastify) {
	// webhook otp wavecell
	fastify.post('/otp', webhookController.doSaveOtpHook);
}

module.exports = routes;
