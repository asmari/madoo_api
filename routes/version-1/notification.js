const notificationSchema = require('../../schema/notificationSchema');
const notificationController = require('../../controller/version-1/notificationController');

async function routes(fastify) {
	// register or update token
	fastify.post('/token', notificationSchema.fcmTokenSchema, notificationController.doRegisterToken);

	// register or update setting notif
	fastify.post('/setting', {
		...notificationSchema.notifSettingSchema,
		beforeHandler: [fastify.authenticate],
	}, notificationController.doChangeSetting);

	// trigger notification
	fastify.get('/trigger', notificationSchema.fcmTriggerSchema, notificationController.doSendNotification);

	// get list notification member
	fastify.get('/member/list', {
		...notificationSchema.notificationListSchema,
		beforeHandler: [fastify.authenticate],
	}, notificationController.getNotificationList);

	// get detail notification member
	fastify.get('/member/detail', {
		...notificationSchema.notificationDetailSchema,
		beforeHandler: [fastify.authenticate],
	}, notificationController.getDetailNotification);
}

module.exports = routes;
