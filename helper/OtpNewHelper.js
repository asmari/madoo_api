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

					if (member.otp === data.otp) {
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

					if (member.otp === data.otp) {
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

		let message = '';

		const randNumb = OtpNewHelper.randNumb();

		switch (type) {
		case 'otp':
			message = `Kode OTP anda : ${randNumb}`;

			if (Object.prototype.hasOwnProperty.call(data, 'memberId')) {
				const member = await OtpMembers.findOne({
					where: {
						members_register_id: data.memberId,
					},
				});

				if (member) {
					await member.update({
						otp: randNumb,
						expiresAt: time,
						wrong: 0,
						webhook_status: '',
					});
				} else {
					await OtpMembers.create({
						otp: randNumb,
						members_register_id: data.memberId,
						expiresAt: time,
						wrong: 0,
						webhook_status: '',
					});
				}
			}

			return instance.send(phone, message, `${randNumb}_otp`);

		case 'forgot':
			message = `Kode OTP Forgot Password anda : ${randNumb}`;

			if (Object.prototype.hasOwnProperty.call(data, 'memberId')) {
				const member = await ForgotPassword.findOne({
					where: {
						members_id: data.memberId,
					},
				});

				if (member) {
					await member.update({
						otp: randNumb,
						expiresAt: time,
						webhook_status: '',
					});
				} else {
					await ForgotPassword.create({
						otp: randNumb,
						members_id: data.memberId,
						expiresAt: time,
						webhook_status: '',
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
