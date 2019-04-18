const {
	workerData,
// eslint-disable-next-line import/no-unresolved
} = require('worker_threads');
const { Op } = require('sequelize');

const model = require('../models/index');
const FcmSender = require('../helper/FcmSender');

const Members = model.Members.Get;
const Notification = model.Notification.Get;
const NotificationMember = model.NotificationMembers.Get;
const NotificationSettings = model.NotificationSettings.Get;
const DeviceNotification = model.DeviceNotification.Get;

const data = workerData;

Notification.findOne({
	where: {
		id: data.id,
	},
	include: [
		{
			model: NotificationMember,
		},
	],
}).then((notification) => {
	if (notification) {
		let doneMember = [];
		if (notification.notification_member !== null) {
			doneMember = notification.notification_member.map(value => value.members_id);
		}

		let whereNotificationSettings = {};

		switch (notification.type) {
		case 'promotion':
			whereNotificationSettings = {
				promotion: 1,
			};
			break;
		case 'conversion':
			whereNotificationSettings = {
				conversion: 1,
			};
			break;
		case 'other':
			whereNotificationSettings = {
				other: 1,
			};
			break;

		default:
			break;
		}

		let whereMembersId = {
			id: {
				[Op.notIn]: doneMember,
			},
		};

		if (data.memberId !== 0) {
			whereMembersId = {
				id: data.memberId,
			};
		}

		const findMembers = Members.findAll({
			where: whereMembersId,
			include: [
				{
					model: DeviceNotification,
					where: {
						fcm_token: {
							[Op.ne]: null,
						},
					},
				},
				{
					model: NotificationSettings,
					where: whereNotificationSettings,
				},
			],
		});

		return Promise.all([findMembers, Promise.resolve(notification)]);
	}

	return Promise.reject(new Error('Notification not found'));
}).then((values) => {
	const members = values[0];
	const notification = values[1];

	if (members.length > 0) {
		const membersSend = members.map(value => value.device_notification.fcm_token);
		const memberId = members.map(value => value.id);

		const fcmRes = FcmSender.send({
			registration_ids: membersSend,
			data: {
				param: JSON.stringify({
					id: notification.id,
					title: notification.title,
					type: notification.type,
					loyalty_id: notification.loyalty_id,
				}),
				image: notification.image,
			},
			priority: 'normal',
			notification: {
				title: notification.title,
				body: notification.description,
				clickAction: notification.click,
			},
		});

		return Promise.all([fcmRes, memberId, notification]);
	}

	return Promise.reject(new Error('members not found'));
}).then((values) => {
	const resFcm = values[0];
	const memberId = values[1];
	const notification = values[2];

	if (resFcm.success > 0) {
		const bulkCreate = memberId.map(value => ({
			members_id: value,
			notification_id: notification.id,
			read: 0,
		}));

		return NotificationMember.bulkCreate(bulkCreate);
	}

	return Promise.reject(new Error(`Notification error not send, ${resFcm}`));
})
	.catch((error) => {
		console.error(error);
	});
