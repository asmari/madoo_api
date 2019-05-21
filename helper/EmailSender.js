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
		console.log(this);
	}


	async send(to, memberId) {
		const { apiKey } = this;
		return new Promise((resolve, reject) => {
			const token = jwt.sign({
				email: to,
				id: memberId,
			}, this.privateKey);

			const file = EmailSender.replaceString(fs.readFileSync(`${__dirname}/../templates/email.html`, 'utf-8'), {
				url: `${config.cms}?token=${token}`,
			});

			const data = {
				name: 'Email Verification Sent',
				subject: 'Email Verification',
				sender: {
					email: 'swapz@member.id',
					name: 'From Swapz',
				},
				htmlContent: file,
				textContent: 'test',
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
