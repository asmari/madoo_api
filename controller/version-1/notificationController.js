// eslint-disable-next-line import/no-unresolved
const { Worker } = require('worker_threads');
const path = require('path');

const { Response } = require('../../helper/response');
const model = require('../../models');

const DeviceNotification = model.DeviceNotification.Get;


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
