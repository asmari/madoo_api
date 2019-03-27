const helper = require('../../helper');
const model = require('../../models');


const DeviceNotification = model.DeviceNotification.Get;
// get random promo
exports.doRegisterToken = async (request, reply) => {
	try {
		const params = JSON.parse(JSON.stringify(request.query));

		const fcmToken = await DeviceNotification.findOne({ members_id: params.members_id });

		let token = null;

		if (fcmToken) {
			fcmToken.update(params);
			token = fcmToken;
		} else {
			token = await DeviceNotification.create(params);
		}
		return reply.code(200).send(helper.Success(token));
	} catch (err) {
		return reply.send(helper.Fail(err));
	}
};
