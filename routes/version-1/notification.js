const notificationSchema = require('../../schema/notificationSchema');
const notificationController = require('../../controller/version-1/notificationController');

async function routes(fastify) {
	// register or update token
	fastify.post('/token', notificationSchema.fcmTokenSchema, notificationController.doRegisterToken);

	// get notification settings
	fastify.get('/setting', {
		...notificationSchema.notificationSettingsSchema,
		beforeHandler: [fastify.authenticate],
	}, notificationController.getNotificationSetting);

	// register or update setting notif
	fastify.post('/setting', {
		...notificationSchema.notifSettingSchema,
		beforeHandler: [fastify.authenticate],
	}, notificationController.doChangeSetting);

	// trigger notification
	fastify.get('/trigger', notificationSchema.fcmTriggerSchema, notificationController.doSendNotification);

	// trigger notification krisflyer
	fastify.get('/trigger/krisflyer', notificationSchema.fcmTriggerKrisflyerSchema, notificationController.doSendNotificationKrisflyer);

	// trigger notification krisflyer
	fastify.post('/trigger/krisflyer', notificationSchema.fcmTriggerKrisflyerPostSchema, notificationController.doSendNotificationKrisflyerPost);

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

	// post notification status
	fastify.post('/status', {
		...notificationSchema.notificationUpdateSchema,
		beforeHandler: [fastify.authenticate],
	}, notificationController.doUpdateNotification);

	// get notification count
	fastify.get('/count', {
		...notificationSchema.notificationCountSchema,
		beforeHandler: [fastify.authenticate],
	}, notificationController.getCountNotification);
}

module.exports = routes;
