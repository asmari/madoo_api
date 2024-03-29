// eslint-disable-next-line import/no-unresolved
const { Worker } = require('worker_threads');
const { Op } = require('sequelize');
const path = require('path');

const { Response, ResponsePaginate, ErrorResponse } = require('../../helper/response');
const model = require('../../models');

const DeviceNotification = model.DeviceNotification.Get;
const Notification = model.Notification.Get;
const NotificationMembers = model.NotificationMembers.Get;
const NotificationSetting = model.NotificationSettings.Get;

// post update notification status
exports.doUpdateNotification = async (request) => {
	const { body, user } = request;

	const notif = await NotificationMembers.findOne({
		where: {
			members_id: user.id,
			notification_id: body.notification_id,
		},
	});

	if (notif) {
		await notif.update({
			read: body.read,
		});

		return new Response(20056, notif);
	}

	return new ErrorResponse(41726);
};

// get notification count
exports.getCountNotification = async (request) => {
	const { user } = request;

	const notif = await NotificationMembers.count({
		where: {
			members_id: user.id,
			read: 0,
		},
	});

	return new Response(20057, {
		count: notif,
	});
};

// get detail notification members
exports.getDetailNotification = async (request) => {
	const { user, query } = request;

	const notification = await Notification.findOne({
		where: {
			id: query.notification_id,
		},
	});

	if (notification) {
		const notificationMembers = await NotificationMembers.findOne({
			where: {
				members_id: user.id,
				notification_id: notification.id,
			},
		});

		if (notificationMembers) {
			await notificationMembers.update({
				read: 1,
			});
		}

		return new Response(20037, notification);
	}
	return new ErrorResponse(41706);
};

// get list notification members
exports.getNotificationList = async (request) => {
	const { user, query } = request;

	const params = {
		filter: query.filter || [],
		page: query.page || 1,
		item: query.item || 10,
	};

	if (!Array.isArray(params.filter)) {
		params.filter = [params.filter];
	}

	params.filter = params.filter.map((value) => {
		if (value === 1) {
			return 'promo';
		}

		if (value === 2) {
			return 'conversion';
		}

		if (value === 3) {
			return 'other';
		}

		return value;
	});

	let whereNotificationFilter = {};

	if (params.filter.length > 0) {
		whereNotificationFilter = {
			type: {
				[Op.in]: params.filter,
			},
		};
	}

	const notification = await Notification.paginate({
		page: params.page,
		paginate: params.item,
		where: whereNotificationFilter,
		order: [
			['id', 'DESC'],
		],
		include: [
			{
				model: NotificationMembers,
				where: {
					members_id: user.id,
				},
			},
		],
	});


	return new ResponsePaginate(20036, {
		...notification,
		item: params.item,
	});
};

// send notification
exports.doSendNotification = async (request) => {
	const params = JSON.parse(JSON.stringify(request.query));

	const worker = new Worker(path.resolve(__dirname, '../../services/notificationServices.js'), {
		workerData: {
			id: params.notification_id,
			memberId: params.members_id || 0,
		},
	});

	// eslint-disable-next-line no-console
	console.log(worker);

	return new Response(20035);
};

// send notification krisflyer
exports.doSendNotificationKrisflyer = async (request) => {
	const { query } = request;

	const worker = new Worker(path.resolve(__dirname, '../../services/notificationKrisflyer.js'), {
		workerData: {
			id: query.batch_id,
		},
	});

	// eslint-disable-next-line no-console
	console.log(worker);

	return new Response(20035);
};

// send notification krisflyer with limit
exports.doSendNotificationKrisflyerPost = async (request) => {
	const { body } = request;

	const worker = new Worker(path.resolve(__dirname, '../../services/notificationKrisflyer.js'), {
		workerData: {
			id: body.batch_id,
			limit: body.limits,
		},
	});

	// eslint-disable-next-line no-console
	console.log(worker);

	return new Response(20035);
};

// save notification token
exports.doRegisterToken = async (request) => {
	const params = request.body;

	try {
		await request.jwtVerify();
	} catch (err) {
		console.error(err);
	}

	const userToken = request.user;

	let whereFix = {
		fcm_token: params.fcm_token,
	};

	if (userToken) {
		params.members_id = userToken.id;

		whereFix = {
			members_id: userToken.id,
		};
	}

	const fcmToken = await DeviceNotification.findOne({
		where: whereFix,
	});

	let token = null;

	if (fcmToken) {
		await fcmToken.update(params);
		token = fcmToken;
	} else {
		token = await DeviceNotification.create(params);
	}
	return new Response(20021, token);
};

exports.getNotificationSetting = async (request) => {
	const { user } = request;

	const setting = await NotificationSetting.findOne({ where: { members_id: user.id } });

	if (setting) {
		return new Response(20053, setting);
	}

	return new ErrorResponse(42212);
};

// save notification token
exports.doChangeSetting = async (request) => {
	const { user, body } = request;

	const setting = await NotificationSetting.findOne({ where: { members_id: user.id } });

	let res = null;
	if (setting) {
		setting.update(body);
		res = setting;
	} else {
		res = await NotificationSetting.create({
			...body,
			members_id: user.id,
		});
	}
	return new Response(20044, res);
};
