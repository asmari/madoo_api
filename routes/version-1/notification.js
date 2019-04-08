const notificationSchema = require('../../schema/notificationSchema');
const notificationController = require('../../controller/version-1/notificationController');

async function routes(fastify) {
	// register or update token
	fastify.post('/token', notificationSchema.fcmTokenSchema, notificationController.doRegisterToken);
}

module.exports = routes;
