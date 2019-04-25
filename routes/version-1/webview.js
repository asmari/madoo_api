const webviewController = require('../../controller/version-1/webviewController');

async function routes(fastify) {
	fastify.get('/', webviewController.getWebviewContent);
}

module.exports = routes;
