const webviewController = require('../../controller/version-1/webviewController');
const staticSchema = require('../../schema/staticContent');

async function routes(fastify) {
	fastify.get('/', staticSchema.webviewSchema, webviewController.getWebviewContent);
}

module.exports = routes;
