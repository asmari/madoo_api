// eslint-disable-next-line import/no-unresolved
const { Worker } = require('worker_threads');
const { Op } = require('sequelize');
const path = require('path');

const { Response, ResponsePaginate, ErrorResponse } = require('../../helper/response');
const model = require('../../models');

const DeviceNotification = model.DeviceNotification.Get;
const Notification = model.Notification.Get;
const NotificationMembers = model.NotificationMembers.Get;

// get detail notification members
exports.getDetailNotification = async (request) => {
	const { query } = request;

	const notification = await Notification.findOne({
		where: {
			id: query.notification_id,
		},
	});

	if (notification) {
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

// save notification token
exports.doRegisterToken = async (request) => {
	const params = JSON.parse(JSON.stringify(request.query));

	const fcmToken = await DeviceNotification.findOne({ fcmToken: params.fcmToken });

	let token = null;

	if (fcmToken) {
		fcmToken.update(params);
		token = fcmToken;
	} else {
		token = await DeviceNotification.create(params);
	}
	return new Response(20021, token);
};
