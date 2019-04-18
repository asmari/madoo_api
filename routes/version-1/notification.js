const notificationSchema = require('../../schema/notificationSchema');
const notificationController = require('../../controller/version-1/notificationController');

async function routes(fastify) {
	// register or update token
	fastify.post('/token', notificationSchema.fcmTokenSchema, notificationController.doRegisterToken);

	// trigger notification
	fastify.get('/trigger', notificationSchema.fcmTriggerSchema, notificationController.doSendNotification);

	// get list notification member
	fastify.get('/member/list', {
		...notificationSchema.notificationListSchema,
		beforeHandler: [fastify.authenticate],
	}, notificationController.getNotificationList);
}

module.exports = routes;
