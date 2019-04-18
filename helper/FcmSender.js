const https = require('https');
const config = require('../config').get;
const model = require('../models/index');

const DeviceNotification = model.DeviceNotification.Get;

module.exports = class FcmSender {
	static async sendToUser(memberId = 0, payload) {
		if (memberId === 0) {
			return Promise.reject(new Error('Member id cannot zero'));
		}

		const member = await DeviceNotification.findOne({
			where: {
				members_id: memberId,
			},
			attributes: ['fcm_token'],
		});

		if (member) {
			const newPayload = {
				...payload,
				registration_ids: member.map(value => value.fcm_token),
			};
			return FcmSender.send(newPayload);
		}

		return Promise.reject(new Error('Member doesnt have device token'));
	}


	static send(payload = {}) {
		return new Promise((resolve, reject) => {
			const req = https.request(config.fcm.url, {
				headers: {
					Authorization: config.fcm.key,
					'Content-Type': 'application/json',
				},
				method: 'POST',
			}, (res) => {
				let chunkData = '';

				res.on('error', reject);

				res.on('data', (data) => {
					chunkData += data;
				});

				res.on('end', () => {
					resolve(chunkData);
				});
			});


			req.write(JSON.stringify(payload), 'utf-8');
			req.end();
		});
	}
};
