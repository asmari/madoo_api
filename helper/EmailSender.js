const nodeMailer = require('nodemailer');
const config = require('../config').get;

module.exports = class EmailSender {
	constructor() {
		this.email = config.email.account;
		this.password = config.email.password;
	}


	async send(to, message) {
		const transporter = nodeMailer.createTransport({
			service: 'gmail',
			auth: {
				user: this.email,
				pass: this.password,
			},
		});

		const mailOptions = {
			from: '"Email Verification" <floorveft@gmail.com>',
			to,
			subject: 'Email Verification',
			text: message,
			html: `Email Verification : <a href="${config.cms}/email/verification?email=${to}">Click Here</a>`,
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
};
