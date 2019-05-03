const https = require('https');
const querystring = require('querystring');

module.exports = class FakeOtp {
	constructor(phone, message) {
		this.phone = phone;
		this.message = message;
	}

	send() {
		const { phone, message } = this;

		const botToken = '833786037:AAFe1qlAYc8Pv1DIMm3YQJIRYFMbrzW6QN8';

		const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

		const parameter = querystring.stringify({
			chat_id: -375935325,
			text: `${phone} Request OTP : ${message}`,
		});

		return new Promise((resolve, reject) => {
			const req = https.request(`${url}?${parameter}`, {
				method: 'POST',
			}, (res) => {
				let chunk = [];

				res.on('error', reject);
				res.on('data', (data) => {
					chunk += data;
				});

				res.on('end', () => {
					const fakeResponse = {
						umid: '6e2024bd-b74b-e911-8145-02d9baaa9e6f',
						clientMessageId: 'forgot_pin:1',
						destination: '6289506284714',
						encoding: 'GSM7',
						status: {
							code: 'QUEUED',
							description: 'SMS is accepted and queued for processing',
						},
					};
					console.log(chunk);
					resolve(fakeResponse);
				});
			});


			req.end();
		});
	}
};
