const { Response } = require('../../helper/response');
const model = require('../../models');


const DeviceNotification = model.DeviceNotification.Get;
// get random promo
exports.doRegisterToken = async (request) => {
	const params = JSON.parse(JSON.stringify(request.query));

	const fcmToken = await DeviceNotification.findOne({ members_id: params.members_id });

	let token = null;

	if (fcmToken) {
		fcmToken.update(params);
		token = fcmToken;
	} else {
		token = await DeviceNotification.create(params);
	}
	return new Response(20021, token);
};
