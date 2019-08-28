const {
	workerData,
// eslint-disable-next-line import/no-unresolved
} = require('worker_threads');
const { Op } = require('sequelize');

const model = require('../models/index');
const FcmSender = require('../helper/FcmSender');
const logger = require('../helper/Logger').Notifications;

const Members = model.Members.Get;
const Notification = model.Notification.Get;
const NotificationMember = model.NotificationMembers.Get;
const NotificationSettings = model.NotificationSettings.Get;
const DeviceNotification = model.DeviceNotification.Get;

const data = workerData;

const run = async () => {
	logger.info(new Date());
	const notification = await Notification.findOne({
		where: {
			id: data.id,
		},
		include: [
			{
				model: NotificationMember,
				as: 'notification_members',
				group: [
					'members_id',
				],
			},
		],
	});

	if (notification) {
		let doneMember = [];
		if (notification.notification_members) {
			doneMember = notification.notification_members.map(value => value.members_id);
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

		whereNotificationSettings.id = {
			[Op.not]: null,
		};

		let whereMembersId = {
			id: {
				[Op.notIn]: doneMember,
			},
		};

		if (notification.recipient_type === 'selected') {
			try {
				const recipient = JSON.parse(notification.recipient);

				const devices = await DeviceNotification.findAll({
					where: {
						fcm_token: {
							[Op.in]: recipient,
						},
						members_id: {
							[Op.ne]: null,
						},
					},
					attributes: ['members_id'],
				});

				const memberDevices = devices.map(value => value.members_id);

				whereMembersId = {
					id: {
						[Op.in]: memberDevices,
					},
				};
			} catch (e) {
				logger.warn(e);
			}
		} else if (data.memberId !== 0) {
			whereMembersId = {
				id: data.memberId,
			};
		} else {
			whereMembersId = {
				id: {
					[Op.notIn]: doneMember,
				},
			};
		}

		const members = await Members.findAll({
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
					required: true,
					where: whereNotificationSettings,
				},
			],
		});

		if (members.length > 0) {
			const membersSend = members.map(value => value.device_notification.fcm_token);
			const memberId = members.map(value => value.id);

			// let deviceNonUser = await DeviceNotification.find({
			// 	where: {
			// 		members_id: {
			// 			[Op.eq]: null,
			// 		},
			// 	},
			// });

			// deviceNonUser = deviceNonUser.map(value => value.fcm_token);

			// membersSend = {
			// 	...membersSend,
			// 	...deviceNonUser,
			// };

			const fcmRes = await FcmSender.send({
				registration_ids: membersSend,
				data: {
					param: JSON.stringify({
						id: notification.id,
						title: notification.title,
						type: notification.type,
						loyalty_id: notification.loyalty_id,
						promo_id: notification.promo_id,
						transaction_id: notification.transaction_id,
					}),
					image: notification.image,
				},
				priority: 'normal',
				notification: {
					title: notification.title,
					body: notification.description,
					click_action: notification.click,
				},
			});

			const resFcm = JSON.parse(fcmRes);

			if (resFcm.success > 0) {
				const bulkCreate = memberId.map(value => ({
					members_id: value,
					notification_id: notification.id,
					read: 0,
				}));
				await notification.update({
					status: 'FINISH',
				});
				return NotificationMember.bulkCreate(bulkCreate);
			}

			logger.warn(fcmRes);
			return Promise.reject(new Error('FCM Failed'));
		}

		return Promise.reject(new Error('No Member Found!'));
	}

	return Promise.reject(new Error('No Notification found!'));
};

run().catch((err) => {
	logger.error(err);
});
