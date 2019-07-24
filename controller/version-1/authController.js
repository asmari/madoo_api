const bcrypt = require('bcrypt');
const model = require('../../models');
const helper = require('../../helper');
const { ErrorResponse, Response } = require('../../helper/response');
const OtpNewHelper = require('../../helper/OtpNewHelper');

const Members = model.Members.Get;
const Pins = model.Pins.Get;
const MembersToken = model.MembersToken.Get;

// Index Auth member
exports.authIndex = async (request, reply) => reply.send({ status: true });

// Procss check member if exists by phone number and country code
exports.doCheckMember = async (request) => {
	const params = request.body;

	if (!Object.prototype.hasOwnProperty.call(params, 'mobile_phone')) {
		// Error: Required field :field
		throw new ErrorResponse(42200, 'mobile_phone');
	}

	const member = await Members.findOne({
		where: {
			mobile_phone: params.mobile_phone,
		},
		paranoid: false,
	});

	if (member) {
		if (member.deleted_at != null) {
			return new ErrorResponse(40112);
		}

		return new Response(20000, {
			user_exists: true,
		});
	}

	return new ErrorResponse(41700);
};

// Process login member
exports.doLogin = async (request, reply) => {
	const params = request.body;

	if (!Object.prototype.hasOwnProperty.call(params, 'mobile_phone')) {
		// Error: Required field :field
		throw new ErrorResponse(42200, 'mobile_phone');
	}

	if (!Object.prototype.hasOwnProperty.call(params, 'pin')) {
		// Error: Required field :field
		throw new ErrorResponse(42200, 'pin');
	}

	const member = await Members.findOne({
		where: {
			mobile_phone: params.mobile_phone,
		},
		paranoid: false,
		include: [Pins],
	});

	if (member == null) {
		// Error: Member not found
		throw new ErrorResponse(41700);
	}

	if (member.deleted_at != null) {
		throw new ErrorResponse(40112);
	}

	const pin = member.pin_member;

	if (bcrypt.compareSync(params.pin, pin.pin)) {
		const payload = {
			id: member.id,
			oauth: false,
		};

		await pin.update({
			wrong: 0,
		});

		const accessToken = await new Promise((resolve, reject) => {
			reply.jwtSign(payload, (err, token) => {
				if (err) {
					reject(err);
				}
				const res = {
					token_type: 'Bearer',
					access_token: token,
					fingerprint: member.finggerprint,
					members_id: member.id,
				};
				resolve(res);
			});
		});

		const memberToken = await MembersToken.findOne({
			where: {
				members_id: member.id,
			},
			paranoid: false,
		});

		if (memberToken !== null) {
			await memberToken.restore();
			await memberToken.update({
				token: accessToken.access_token,
			});
		} else {
			await MembersToken.create({
				members_id: member.id,
				token: accessToken.access_token,
			});
		}

		return new Response(20000, accessToken);
	}

	if (pin) {
		const pinMember = await Pins.findOne({
			where: {
				members_id: member.id,
			},
		});

		const wrong = pinMember.wrong == null ? 0 : pinMember.wrong;

		if (wrong >= 4) {
			await Members.destroy({
				where: {
					id: member.id,
				},
			});

			await MembersToken.destroy({
				where: {
					members_id: member.id,
				},
			});
		}

		await pinMember.update({
			wrong: wrong + 1,
		});
	}

	// Error: Pin member is not valid
	throw new ErrorResponse(40103);
};

// forgot pin otp
exports.setForgotPinOtp = async (request) => {
	const params = request.body;
	const otpNewHelper = new OtpNewHelper();

	const member = await Members.findOne({
		where: {
			mobile_phone: params.mobile_phone,
		},
	});

	if (member) {
		// const resOtp = await otpHelper.forgotPinOtp({
		// 	members_id: member.id,
		// }, params.mobile_phone);

		try {
			const resOtp = await otpNewHelper.sendOtp(params.mobile_phone, {
				type: 'forgot',
				data: {
					memberId: member.id,
				},
			});

			return new Response(20001, resOtp);
		} catch (err) {
			const errMessage = err.message.replace('Error', '').trim();
			switch (errMessage) {
			case OtpNewHelper.STATUS.OTP_NOT_MATCH:
				return new ErrorResponse(40107);
			case OtpNewHelper.STATUS.OTP_NOT_MATCH_5_TIMES:
				return new ErrorResponse(40108);
			case OtpNewHelper.STATUS.OTP_EXPIRED:
				return new ErrorResponse(40109);
			case OtpNewHelper.STATUS.OTP_CANT_RESEND_24_HOURS:
				return new ErrorResponse(40111, {
					time: '1 x 24 hour',
				});
			default:
				return new ErrorResponse(40198, {
					message: errMessage,
				});
			}
		}
	}

	// Error: Member not found
	throw new ErrorResponse(41700);
};

// check forgot pin otp
exports.checkForgotPinOtp = async (request) => {
	const params = request.body;
	const otpNewHelper = new OtpNewHelper();

	const member = await Members.findOne({
		where: {
			mobile_phone: params.mobile_phone,
		},
	});

	if (member) {
		// const resOtp = await otpHelper.forgotCheckOtp({
		// 	members_id: member.id,
		// }, params.otp);

		try {
			const res = await otpNewHelper.checkOtp('', {
				type: 'forgot',
				data: {
					memberId: member.id,
					otp: params.otp,
				},
			});

			switch (res.toString()) {
			case OtpNewHelper.STATUS.OTP_MATCH:
				return new Response(20032);
			default:
				return new Response(20032);
			}
		} catch (err) {
			switch (err.toString()) {
			case OtpNewHelper.STATUS.OTP_NOT_MATCH:
				return new ErrorResponse(40107);
			case OtpNewHelper.STATUS.OTP_NOT_MATCH_5_TIMES:
				return new ErrorResponse(40108);
			case OtpNewHelper.STATUS.OTP_EXPIRED:
				return new ErrorResponse(40109);
			default:
				return new ErrorResponse(40198, {
					message: err.toString(),
				});
			}
		}
	}

	// Error: Member not found
	throw new ErrorResponse(41700);
};


// change forgot pin
exports.doChangePin = async (request, reply) => {
	const params = request.body;

	if (params.pin !== params.confirm_pin) {
		// Error: :field is not same with :field_target
		throw new ErrorResponse(42204, {
			field: 'confirm_pin',
			field_target: 'pin',
		});
	}

	if (params.pin.toString().length > 6 || params.pin.toString().length < 6) {
		// Error: :field length must exact :length
		throw new ErrorResponse(42205, {
			field: 'Pin',
			length: 6,
		});
	}

	const member = await Members.findOne({
		where: {
			mobile_phone: params.mobile_phone,
		},
	});

	if (member) {
		const pin = await Pins.findOne({
			where: {
				members_id: member.id,
			},
		});

		const pinHash = bcrypt.hashSync(params.pin.toString(), 10);

		if (pin == null) {
			await Pins.create({
				pin: pinHash,
				members_id: member.id,
				token: '',
				expired: new Date(),
				wrong: 0,
			});
		} else {
			pin.update({
				pin: pinHash,
				members_id: member.id,
				wrong: 0,
			});
		}

		// const isOauth = !!(member.fb_id != null || member.g_id != null);

		// const payload = {
		// 	id: member.id,
		// 	oauth: isOauth,
		// };

		// const res = await new Promise((resolve, reject) => {
		// 	reply.jwtSign(payload, (err, token) => {
		// 		if (err) {
		// 			reject(helper.Fail(err));
		// 		}
		// 		const response = {
		// 			token_type: 'Bearer',
		// 			access_token: token,
		// 			fingerprint: member.finggerprint,
		// 		};

		// 		resolve(response);
		// 	});
		// });

		const memberToken = await MembersToken.findOne({
			where: {
				members_id: member.id,
			},
			paranoid: false,
		});

		await memberToken.restore();

		return new Response(20040, memberToken);
	}

	// Error: Member not found
	throw new ErrorResponse(41700);
};

// unlink social media
exports.doUnlinkSocialMedia = async (request) => {
	const { user, body } = request;
	const members = await Members.findOne({
		where: {
			id: user.id,
		},
	});

	if (members) {
		switch (body.type) {
		case 1:
			await members.update({
				fb_id: null,
				fb_token: null,
				fb_name: null,
			});
			break;

		case 2:
			await members.update({
				g_id: null,
				g_token: null,
				g_name: null,
			});
			break;

		default:

			break;
		}

		return new Response(20041, members);
	}

	return new ErrorResponse(41700);
};

// link social media
exports.doLinkSocialMedia = async (request) => {
	const { user, body } = request;
	const members = await Members.findOne({
		where: {
			id: user.id,
		},
	});

	if (!Object.prototype.hasOwnProperty.call(body, 'name')) {
		body.name = '';
	}

	if (members) {
		switch (body.type) {
		case 1:
			await members.update({
				fb_id: body.id,
				fb_token: body.token,
				fb_name: body.name,
			});
			break;

		case 2:
			await members.update({
				g_id: body.id,
				g_token: body.token,
				g_name: body.name,
			});
			break;

		default:

			break;
		}

		return new Response(20046, members);
	}

	return new ErrorResponse(41700);
};
