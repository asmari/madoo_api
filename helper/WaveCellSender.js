const https = require('https');
const FakeOtp = require('./FakeOtp');
const config = require('../config').get;

module.exports = class WaveCellSender {
	constructor() {
		this.subAccount = config.sms.subAccount;
		this.token = config.sms.token;

		this.url = {
			POST_SEND_OTP: () => `https://api.wavecell.com/verify/v1/${this.subAccount}`,
			GET_VALIDATION_OTP: uid => `https://api.wavecell.com/verify/v1/${this.subAccount}/${uid}`,
		};
	}

	getUrl(type = 'single') {
		return `https://api.wavecell.com/sms/v1/${this.subAccount}/${type}`;
	}

	static parsePhoneNumber(phone) {
		try {
			if (phone.substring(0, 1) !== '+') {
				return `+${phone}`;
			}
			return phone;
		} catch (err) {
			return phone;
		}
	}

	checkOtp(otp, uid) {
		const { token } = this;

		return new Promise((resolve, reject) => {
			try {
				const url = `${this.url.GET_VALIDATION_OTP(uid)}?code=${otp}`;

				const req = https.request(url, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
					method: 'GET',
				}, (res) => {
					let chunk = [];

					res.on('error', reject);
					res.on('data', (buffer) => {
						chunk += buffer;
					});

					res.on('end', () => {
						if (res.statusCode === 200) {
							resolve(JSON.parse(chunk));
						} else {
							reject(JSON.parse(chunk));
						}
					});
				});

				req.end();
			} catch (err) {
				reject(err);
			}
		});
	}

	sendOtp(varPhone) {
		const { token } = this;
		let phone = varPhone;
		return new Promise((resolve, reject) => {
			try {
				phone = WaveCellSender.parsePhoneNumber(phone);


				const data = JSON.stringify({
					destination: phone,
					productName: 'Husky',
					codeLength: 6,
					codeValidity: 300,
					resendingInterval: 300,
					codeType: 'NUMERIC',
					template: {
						source: 'Husky',
						text: 'Kode otp anda untuk {productName} adalah {code}. expire kode otp anda 2 menit ',
					},
				});

				const url = this.url.POST_SEND_OTP();

				const req = https.request(url, {
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
						'Content-Length': Buffer.byteLength(data),
					},
					method: 'POST',
				}, (res) => {
					let chunk = [];

					res.on('error', reject);
					res.on('data', (buffer) => {
						chunk += buffer;
					});

					res.on('end', () => {
						if (res.statusCode === 200) {
							resolve(JSON.parse(chunk));
						} else {
							reject(JSON.parse(chunk));
						}
					});
				});

				req.write(data);
				req.end();
			} catch (err) {
				reject(err);
			}
		});
	}

	send(varPhone, message, clientId = 0, type = 'single') {
		const { token } = this;
		const phone = WaveCellSender.parsePhoneNumber(varPhone);

		if (config.app_env === 'dev' || config.app_env === 'staging') {
			const fakeOtp = new FakeOtp(phone, message);
			return fakeOtp.send();
		}

		return new Promise((resolve, reject) => {
			try {
				const data = JSON.stringify({
					source: config.sms.source,
					destination: phone,
					text: message,
					clientMessageId: clientId,
					enconding: 'AUTO',
					/* PRODUCTION */
					dlrCallbackUrl: `${config.url}/v1/webhook/otp`,

					/* TESTING, for inspect https://requestbin.fullcontact.com/vatvlzva?inspect */
					// dlrCallbackUrl: 'http://requestbin.fullcontact.com/vatvlzva',
				});

				const url = this.getUrl(type);

				const req = https.request(url, {
					headers: {
						'Content-Length': Buffer.byteLength(data),
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					method: 'POST',
				}, (res) => {
					let chunk = [];

					res.on('error', reject);
					res.on('data', (buffer) => {
						chunk += buffer;
					});

					res.on('end', () => {
						if (res.statusCode === 200) {
							resolve(JSON.parse(chunk));
						} else {
							reject(JSON.parse(chunk));
						}
					});
				});

				req.write(data);
				req.end();
			} catch (err) {
				reject(err);
			}
		});
	}
};
