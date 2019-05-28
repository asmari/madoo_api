const https = require('https');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const config = require('../config').get;
const model = require('../models/index');

const UpdateMemberLogs = model.UpdateMemberLogs.Get;

module.exports = class EmailSender {
	constructor() {
		this.apiKey = config.mail.apiKey;
		this.privateKey = 'RQa0Acew3nasbf6I5kIUI1kfSTqhrEsF';
		this.url = 'https://api.sendinblue.com/v3/smtp/email';
	}

	async sendConversion(to, data) {
		return this.process({
			to,
			data,
			template: `${__dirname}/../templates/successConversion.html`,
			body: {
				name: 'Conversion Success',
				subject: 'Conversion Success',
				sender: {
					email: 'swapz@member.id',
					name: 'From Swapz',
				},
				to: [
					{
						email: to,
						name: 'test',
					},
				],
				replyTo: {
					email: 'swapz@member.id',
					name: 'From Swapz',
				},
				tags: ['conversion_success'],
			},
		});
	}

	async send(to, memberId) {
		const token = jwt.sign({
			email: to,
			id: memberId,
		}, this.privateKey);

		return this.process({
			to,
			data: {
				url: `${config.cms}?token=${token}`,
			},
			template: `${__dirname}/../templates/email.html`,
			body: {
				name: 'Email Verification Sent',
				subject: 'Email Verification',
				sender: {
					email: 'swapz@member.id',
					name: 'From Swapz',
				},
				to: [
					{
						email: to,
						name: 'test',
					},
				],
				replyTo: {
					email: 'swapz@member.id',
					name: 'From Swapz',
				},
				tags: ['email_verification'],
			},
		});
	}

	async process(options) {
		const { apiKey } = this;
		return new Promise((resolve, reject) => {
			const file = EmailSender.replaceString(fs.readFileSync(options.template, 'utf-8'), options.data);

			const data = {
				...options.body,
				htmlContent: file,
			};

			const req = https.request(this.url, {
				headers: {
					'api-key': apiKey,
					'Content-Type': 'application/json',
				},
				method: 'POST',
			}, (res) => {
				let chunk = '';

				res.on('data', (d) => {
					chunk += d;
				});

				res.on('error', reject);

				res.on('end', () => {
					resolve(chunk);
				});
			});

			req.write(JSON.stringify(data));
			req.end();
		});
	}

	static replaceString(file, obj) {
		return file.replace(/\${([^}]*)}/g, (r, k) => obj[k]);
	}

	async checkVerification(token) {
		return new Promise((resolve, reject) => {
			jwt.verify(token, this.privateKey, async (err, decoded) => {
				if (err) {
					reject(err);
				} else {
					const log = await UpdateMemberLogs.findOne({
						where: {
							value_after: decoded.email,
							members_id: decoded.id,
						},
						order: [
							['created_at', 'DESC'],
						],
					});

					if (log) {
						await log.update({
							is_verified: 1,
						});

						resolve(log);
					} else {
						reject(new Error('Log not found'));
					}
				}
			});
		});
	}
};
