const nodeMailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const config = require('../config').get;
const model = require('../models/index');

const UpdateMemberLogs = model.UpdateMemberLogs.Get;

module.exports = class EmailSender {
	constructor() {
		this.email = config.email.account;
		this.password = config.email.password;
		this.privateKey = 'RQa0Acew3nasbf6I5kIUI1kfSTqhrEsF';
	}


	async send(to, memberId) {
		const transporter = nodeMailer.createTransport({
			service: 'gmail',
			auth: {
				user: this.email,
				pass: this.password,
			},
		});

		const token = jwt.sign({
			email: to,
			id: memberId,
		}, this.privateKey);

		const mailOptions = {
			from: '"Email Verification" <floorveft@gmail.com>',
			to,
			subject: 'Email Verification',
			html: `Email Verification : <a href="${config.email.verificationUrl}?token=${token}">Click Here</a>`,
		};

		return new Promise((resolve, reject) => {
			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					reject(error);
				} else {
					resolve(info);
				}
			});
		});
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
