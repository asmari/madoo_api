const moment = require('moment');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

const model = require('../../models');
const { ErrorResponse, Response } = require('../../helper/response');
const EmailSender = require('../../helper/EmailSender');
const OtpNewHelper = require('../../helper/OtpNewHelper');
const CountryCode = require('../../helper/CountryCode');

const Members = model.Members.Get;
const MembersRegister = model.MembersRegister.Get;
const Pins = model.Pins.Get;
const Otp = model.Otp.Get;
const UpdateMemberLogs = model.UpdateMemberLogs.Get;
const NotificationSettings = model.NotificationSettings.Get;
const MembersToken = model.MembersToken.Get;

// Index Auth member
exports.memberIndex = async () => {
	const memberRegister = await MembersRegister.all({
		include: [Otp],
	});

	return new Response(20019, memberRegister);
};

// process to memberRegister with phone
exports.doRegisterPhone = async (request) => {
	const params = request.body;
	const otpNewHelper = new OtpNewHelper();

	const countryCode = CountryCode.detectCountry(params.mobile_phone, params.country_code || null);

	if (countryCode == null) {
		// Error: Required field :field
		throw new ErrorResponse(42200, {
			field: 'country_code',
		});
	}

	const wherePhone = {};

	if (countryCode !== null) {
		wherePhone[Op.or] = [
			{
				mobile_phone: countryCode.mobile_phone,
				country_code: countryCode.code,
			},
			{
				mobile_phone: countryCode.fullphone,
			},
		];
	} else {
		wherePhone.mobile_phone = params.mobile_phone;
	}

	const member = await Members.findOne({
		paranoid: false,
		where: wherePhone,
	});

	if (member) {
		return new ErrorResponse(40104, {
			field: 'Phone Number',
		});
	}

	const memberEmail = await Members.findOne({
		paranoid: false,
		where: {
			[Op.or]: [
				{
					email: params.email,
				}, {
					fb_email: params.email,
				}, {
					g_email: params.email,
				},
			],
		},
	});

	if (memberEmail) {
		return new ErrorResponse(40113);
	}

	const memberRegister = await MembersRegister.findOne({
		where: wherePhone,
	}, {});
	if (memberRegister) {
		// if (memberRegister.status !== 'registered') {
		// const sendOtp = await otpHelper.sendOtp({
		// 	members_register_id: memberRegister.id,
		// }, memberRegister.mobile_phone);
		try {
			const res = await otpNewHelper.sendOtp(countryCode.fullphone, {
				type: 'otp',
				data: {
					memberId: memberRegister.id,
				},
			});

			switch (res.toString()) {
			case OtpNewHelper.STATUS.OTP_CANT_RESEND_24_HOURS:
				return new ErrorResponse(40111, res);
			default:
				return new Response(20001, res);
			}
		} catch (err) {
			console.log(err);
			return new ErrorResponse(40111, {
				time: '1 x 24 hour',
			});
		}
		// }

		// Error: Member already registered! Please login
		// throw new ErrorResponse(40105);
	} else {
		const payload = {
			full_name: params.full_name,
			email: params.email,
			fb_email: '-',
			g_email: '-',
			mobile_phone: countryCode.mobile_phone,
			country_code: countryCode.code,
			status: 'pending',
		};
		const newMember = await MembersRegister.create(payload);
		// const sendOtp = await otpHelper.sendOtp({
		// 	members_register_id: newMember.id,
		// }, newMember.mobile_phone);

		try {
			const res = await otpNewHelper.sendOtp(countryCode.fullphone, {
				type: 'otp',
				data: {
					memberId: newMember.id,
				},
			});

			switch (res.toString()) {
			case OtpNewHelper.STATUS.OTP_CANT_RESEND_24_HOURS:
				return new ErrorResponse(40111, res);
			default:
				return new Response(20001, res);
			}
		} catch (err) {
			return new ErrorResponse(40111, {
				time: '1 x 24 hour',
			});
		}
	}
};

exports.doOtpValidation = async (request) => {
	const params = request.body;
	const otpNewHelper = new OtpNewHelper();

	const countryCode = CountryCode.detectCountry(params.mobile_phone, params.country_code || null);

	if (countryCode == null) {
		// Error: Required field :field
		throw new ErrorResponse(42200, {
			field: 'country_code',
		});
	}

	const wherePhone = {};

	if (countryCode !== null) {
		wherePhone[Op.or] = [
			{
				mobile_phone: countryCode.mobile_phone,
				country_code: countryCode.code,
			},
			{
				mobile_phone: countryCode.fullphone,
			},
		];
	} else {
		wherePhone.mobile_phone = params.mobile_phone;
	}

	const memberRegister = await MembersRegister.findOne({
		include: [Otp],
		where: {
			...wherePhone,
			status: 'pending',
		},
	});

	if (memberRegister) {
		try {
			const res = await otpNewHelper.checkOtp('', {
				type: 'otp',
				data: {
					memberId: memberRegister.id,
					otp: params.otp,
				},
			});

			switch (res.toString()) {
			case OtpNewHelper.STATUS.OTP_MATCH:
				return new Response(20032);
			default:
				return res;
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

exports.doSaveMember = async (request, reply) => {
	const params = request.body;

	const expired = moment().add(1, 'month').format('YYYY-MM-DD HH:mm:ss');
	params.pin = bcrypt.hashSync(params.pin.toString(), 10);

	const countryCode = CountryCode.detectCountry(params.mobile_phone, params.country_code || null);

	if (countryCode == null) {
		// Error: Required field :field
		throw new ErrorResponse(42200, {
			field: 'country_code',
		});
	}

	const wherePhone = {};

	if (countryCode !== null) {
		wherePhone[Op.or] = [
			{
				mobile_phone: countryCode.mobile_phone,
				country_code: countryCode.code,
			},
			{
				mobile_phone: countryCode.fullphone,
			},
		];
	} else {
		wherePhone.mobile_phone = params.mobile_phone;
	}

	const memberRegister = await MembersRegister.findOne({
		where: {
			...wherePhone,
			status: 'pending',
		},
	});

	if (memberRegister) {
		const member = await Members.create({
			...params,
			mobile_phone: countryCode.mobile_phone,
			country_code: countryCode.code,
			g_email: '-',
			fb_email: '-',
		});
		const pin = await Pins.create({ pin: params.pin, members_id: member.id, expired });
		await memberRegister.update({ status: 'registered' });
		const payload = {
			id: member.id,
			oauth: false,
		};

		await NotificationSettings.create({
			members_id: member.id,
			promotion: 1,
			conversion: 1,
			other: 1,
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
				};
				pin.update({ token });

				resolve(res);
			});
		});

		const memberToken = await MembersToken.findOne({
			where: {
				members_id: member.id,
			},
		});

		if (memberToken !== null) {
			memberToken.update({
				token: accessToken.access_token,
			});
		} else {
			await MembersToken.create({
				members_id: member.id,
				token: accessToken.access_token,
			});
		}

		if (params.email) {
			await UpdateMemberLogs.create({
				type: 'email',
				members_id: member.id,
				value_before: member.email,
				value_after: member.email,
				is_verified: 0,
			});

			const emailer = new EmailSender();

			await emailer.send(params.email, member.id);
		}

		return new Response(20005, accessToken);
	}
	// Error: Member not found
	throw new ErrorResponse(41700);
};

exports.memberDetail = async (request) => {
	const token = await request.jwtVerify();

	const member = await Members.findOne({
		attributes: [
			'full_name',
			'email',
			'country_code',
			'mobile_phone',
			'image',
			'fb_id',
			'fb_token',
			'g_id',
			'g_token',
			'fb_name',
			'g_name',
		],
		where: { id: token.id },
	});

	if (member) {
		return new Response(20025, member);
	}

	// Error: Member not found
	throw new ErrorResponse(41700);
};

exports.doPinValidation = async (request) => {
	const token = await request.jwtVerify();
	const params = request.body;

	const pinMember = await Pins.findOne({ attributes: ['id', 'pin', 'wrong'], where: { members_id: token.id } });
	const member = await Members.findOne({
		where: {
			id: token.id,
		},
		paranoid: false,
	});

	if (member.deleted_at != null) {
		throw new ErrorResponse(40112);
	}


	if (pinMember) {
		if (bcrypt.compareSync(params.pin.toString(), pinMember.pin.toString())) {
			await pinMember.update({
				wrong: 0,
			});

			return new Response(20026, { pin_valid: true });
		}
		const wrong = pinMember.wrong == null ? 0 : pinMember.wrong;

		console.log(wrong);

		if (wrong >= 4) {
			await Members.destroy({
				where: {
					id: token.id,
				},
			});

			await MembersToken.destroy({
				where: {
					members_id: token.id,
				},
			});
		}

		await pinMember.update({
			wrong: wrong + 1,
		});

		return new ErrorResponse(40103);
	}

	// Error: Pin not found
	throw new ErrorResponse(41700);
};
exports.doChangePin = async (request) => {
	const token = await request.jwtVerify();
	const params = request.body;

	const pinMember = await Pins.findOne({ attributes: ['id', 'pin'], where: { members_id: token.id } });

	if (pinMember) {
		if (bcrypt.compareSync(params.old_pin.toString(), pinMember.pin)) {
			if (params.new_pin.toString() === params.confirm_pin.toString()) {
				params.pin = bcrypt.hashSync(params.new_pin.toString(), 10);
				pinMember.update({ pin: params.pin });
				return new Response(20031, { change_pin: true });
			}
			return new ErrorResponse(40106);
		}
		return new ErrorResponse(40103);
	}

	// Error: Pin not found
	throw new ErrorResponse(41700);
};

exports.doUpdateMember = async (request) => {
	const { user, body } = request;
	if (!body.email && !body.mobile_phone) {
		throw new ErrorResponse(42200, {
			field: 'mobile_phone or email',
		});
	}

	const countryCode = CountryCode.detectCountry(body.mobile_phone, body.country_code || null);

	if (countryCode == null) {
		// Error: Required field :field
		throw new ErrorResponse(42200, {
			field: 'country_code',
		});
	}

	const wherePhone = {};

	if (countryCode !== null) {
		wherePhone[Op.or] = [
			{
				mobile_phone: countryCode.mobile_phone,
				country_code: countryCode.code,
			},
			{
				mobile_phone: countryCode.fullphone,
			},
		];
	} else {
		wherePhone.mobile_phone = body.mobile_phone;
	}

	const member = await Members.findOne({ where: { id: user.id } });
	if (member) {
		if (body.full_name) {
			await member.update({
				full_name: body.full_name,
			});
		}
		if (body.email) {
			const emailExist = await Members.findOne({ where: { email: body.email } });
			if (!emailExist) {
				await UpdateMemberLogs.create({
					type: 'email',
					members_id: member.id,
					value_before: member.email,
					value_after: body.email,
					is_verified: 0,
				});

				const emailer = new EmailSender();

				await emailer.send(body.email, member.id);

				// await member.update({
				// 	email: body.email,
				// });
				body.email_exists = false;
			} else {
				body.email_exists = true;
			}
		}
		if (body.mobile_phone) {
			const phoneExist = await Members.findOne({ where: wherePhone });
			if (!phoneExist) {
				await UpdateMemberLogs.create({
					type: 'mobile_phone',
					members_id: member.id,
					value_before: `${member.country_code}${member.mobile_phone}`,
					value_after: countryCode.fullphone,
					is_verified: 0,
				});

				body.phone_exists = false;
			} else {
				body.phone_exists = true;
			}
		}
		return new Response(20047, body);
	}

	// Error: Member not found
	throw new ErrorResponse(41700);
};

// send otp update member phone
exports.doSendOtpUpdateMember = async (request) => {
	const { user, body } = request;

	const otpNewHelper = new OtpNewHelper();

	const member = await Members.findOne({
		where: {
			id: user.id,
		},
	});

	const countryCode = CountryCode.detectCountry(body.mobile_phone, body.country_code || null);

	if (countryCode == null) {
		// Error: Required field :field
		throw new ErrorResponse(42200, {
			field: 'country_code',
		});
	}

	const wherePhone = {};

	if (countryCode !== null) {
		wherePhone[Op.or] = [
			{
				mobile_phone: countryCode.mobile_phone,
				country_code: countryCode.code,
			},
			{
				mobile_phone: countryCode.fullphone,
			},
		];
	} else {
		wherePhone.mobile_phone = body.mobile_phone;
	}

	if (member) {
		try {
			const res = await otpNewHelper.sendOtp(countryCode.fullphone, {
				type: 'update_member',
				data: {
					memberId: user.id,
				},
			});

			switch (res.toString()) {
			case OtpNewHelper.STATUS.OTP_CANT_RESEND_24_HOURS:
				return new ErrorResponse(40111, res);
			default:
				return new Response(20001, res);
			}
		} catch (err) {
			console.log(err);
			return new ErrorResponse(40111, {
				time: '1 x 24 hour',
			});
		}
	}

	return new ErrorResponse(41700);
};


// check otp update member
exports.doCheckOtpUpdateMember = async (request) => {
	const { user, body } = request;

	const countryCode = CountryCode.detectCountry(body.mobile_phone, body.country_code || null);

	if (countryCode == null) {
		// Error: Required field :field
		throw new ErrorResponse(42200, {
			field: 'country_code',
		});
	}

	const wherePhone = {};

	if (countryCode !== null) {
		wherePhone[Op.or] = [
			{
				mobile_phone: countryCode.mobile_phone,
				country_code: countryCode.code,
			},
			{
				mobile_phone: countryCode.fullphone,
			},
		];
	} else {
		wherePhone.mobile_phone = body.mobile_phone;
	}

	const otpNewHelper = new OtpNewHelper();

	const members = await Members.findOne({
		where: {
			id: user.id,
		},
	});

	if (members) {
		try {
			const res = await otpNewHelper.checkOtp('', {
				type: 'update_member',
				data: {
					memberId: members.id,
					otp: body.otp,
				},
			});

			switch (res.toString()) {
			case OtpNewHelper.STATUS.OTP_MATCH:

				// eslint-disable-next-line no-case-declarations
				const logs = await UpdateMemberLogs.findOne({
					where: {
						type: 'mobile_phone',
						members_id: members.id,
						value_after: countryCode.fullphone,
					},
					order: [
						['created_at', 'DESC'],
					],
				});

				if (logs) {
					await logs.update({
						is_verified: 1,
					});
				}

				await members.update({
					mobile_phone: countryCode.mobile_phone,
					country_code: countryCode.code,
				});

				return new Response(20049, members);
			default:
				return res;
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

	return new ErrorResponse(41700);
};

exports.doVerifyEmail = async (request) => {
	const { query } = request;

	const emailSender = new EmailSender();

	try {
		const info = await emailSender.checkVerification(query.token);
		console.log(info);
		return new Response(20050);
	} catch (err) {
		return new ErrorResponse(41713);
	}
};

exports.doRemoveToken = async (request) => {
	const { body } = request;

	const membersToken = await MembersToken.findOne({
		where: {
			members_id: body.user_id,
		},
		paranoid: false,
	});

	if (membersToken) {
		if (membersToken.deleted_at === null) {
			membersToken.destroy();
		}

		return new Response(20059);
	}

	return new Response(20060);
};
