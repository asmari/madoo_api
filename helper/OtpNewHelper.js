const WaveCellSender = require('./WaveCellSender');
const model = require('../models');

const OtpMembers = model.Otp.Get;
const ForgotPassword = model.ForgotPassword.Get;

module.exports = class OtpNewHelper {
	constructor() {
		this.instance = new WaveCellSender();
	}

	static get STATUS() {
		return {
			OTP_MATCH: 'OTP_MATCH',
			OTP_NOT_MATCH: 'OTP_NOT_MATCH',
			OTP_EXPIRED: 'OTP_EXPIRED',
			OTP_NOT_MATCH_5_TIMES: 'OTP_NOT_MATCH_5_TIMES',
			OTP_RESEND_5_TIMES: 'OTP_RESEND_5_TIMES',
			OTP_CANT_RESEND_24_HOURS: 'OTP_CANT_RESEND_24_HOURS',
		};
	}

	static randNumb() {
		return Math.floor((Math.random() * (999999 - 100000)) + 100000);
	}

	// eslint-disable-next-line class-methods-use-this
	async checkOtp(phone, args) {
		const { type, data } = args;
		const currentTime = new Date();

		switch (type) {
		case 'otp':

			if (Object.prototype.hasOwnProperty.call(data, 'memberId') && Object.prototype.hasOwnProperty.call(data, 'otp')) {
				const member = await OtpMembers.findOne({
					where: {
						members_register_id: data.memberId,
					},
				});

				if (member) {
					if (member.expiresAt.getTime() < currentTime) {
						return Promise.reject(OtpNewHelper.STATUS.OTP_EXPIRED);
					}

					const wrong = member.wrong === null ? 0 : member.wrong;

					if (wrong >= 5) {
						return Promise.reject(OtpNewHelper.STATUS.OTP_NOT_MATCH_5_TIMES);
					}

					if (member.otp === parseInt(data.otp, 10)) {
						return Promise.resolve(OtpNewHelper.STATUS.OTP_MATCH);
					}

					await member.update({
						wrong: (wrong + 1),
					});

					return Promise.reject(OtpNewHelper.STATUS.OTP_NOT_MATCH);
				}
			}

			return Promise.reject(new Error('memberId or otp not found!'));

		case 'forgot':
			if (Object.prototype.hasOwnProperty.call(data, 'memberId') && Object.prototype.hasOwnProperty.call(data, 'otp')) {
				const member = await ForgotPassword.findOne({
					where: {
						members_id: data.memberId,
					},
				});

				if (member) {
					if (member.expiresAt.getTime() < currentTime) {
						return Promise.reject(OtpNewHelper.STATUS.OTP_EXPIRED);
					}

					const wrong = member.wrong === null ? 0 : member.wrong;

					if (wrong >= 5) {
						return Promise.reject(OtpNewHelper.STATUS.OTP_NOT_MATCH_5_TIMES);
					}

					if (member.otp === parseInt(data.otp, 10)) {
						return Promise.resolve(OtpNewHelper.STATUS.OTP_MATCH);
					}

					await member.update({
						wrong: wrong + 1,
					});

					return Promise.reject(OtpNewHelper.STATUS.OTP_NOT_MATCH);
				}
			}

			return Promise.reject(new Error('memberId or otp not found!'));

		default:

			return 1;
		}
	}

	async sendOtp(phone, args) {
		const { instance } = this;
		const { type, data } = args;

		const time = new Date();
		time.setSeconds(time.getSeconds() + 180);

		const currentTime = new Date().getTime();

		let message = '';

		const randNumb = OtpNewHelper.randNumb();

		switch (type) {
		case 'otp':
			message = `Your SWAPZ code is ${randNumb}`;

			if (Object.prototype.hasOwnProperty.call(data, 'memberId')) {
				const member = await OtpMembers.findOne({
					where: {
						members_register_id: data.memberId,
					},
				});

				if (member) {
					// eslint-disable-next-line max-len
					const compare = Math.round((currentTime / 1000) - (new Date(member.last_resend).getTime() / 1000));

					if (member.resend_count >= 5 && compare <= 86400) {
						return Promise.reject(new Error(OtpNewHelper.STATUS.OTP_CANT_RESEND_24_HOURS));
					}

					const resendCount = member.resend_count + 1;
					await member.update({
						otp: randNumb,
						expiresAt: time,
						wrong: 0,
						resend_count: resendCount,
						last_resend: new Date(),
						webhook_status: '',
					});
				} else {
					await OtpMembers.create({
						otp: randNumb,
						members_register_id: data.memberId,
						expiresAt: time,
						wrong: 0,
						resend_count: 0,
						last_resend: new Date(),
						webhook_status: '',
					});
				}
			}
			return instance.send(phone, message, `${randNumb}_otp`);

		case 'forgot':
			message = `Your SWAPZ code is ${randNumb}`;

			if (Object.prototype.hasOwnProperty.call(data, 'memberId')) {
				const member = await ForgotPassword.findOne({
					where: {
						members_id: data.memberId,
					},
				});

				if (member) {
					// eslint-disable-next-line max-len
					const compare = Math.round((currentTime / 1000) - (new Date(member.last_resend).getTime() / 1000));

					if (member.resend_count >= 5 && compare <= 86400) {
						return Promise.reject(new Error(OtpNewHelper.STATUS.OTP_CANT_RESEND_24_HOURS));
					}

					const resendCount = member.resend_count + 1;
					await member.update({
						otp: randNumb,
						expiresAt: time,
						webhook_status: '',
						resend_count: resendCount,
						last_resend: new Date(),
					});
				} else {
					await ForgotPassword.create({
						otp: randNumb,
						members_id: data.memberId,
						expiresAt: time,
						webhook_status: '',
						last_resend: new Date(),
						resend_count: 0,
					});
				}
			}
			return instance.send(phone, message, `${randNumb}_forgot`);

		default:
			break;
		}

		return Promise.resolve('Not running anything');
	}
};
