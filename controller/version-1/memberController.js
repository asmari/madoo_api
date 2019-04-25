const moment = require('moment');
const bcrypt = require('bcrypt');

const model = require('../../models');
const { ErrorResponse, Response } = require('../../helper/response');
const OtpNewHelper = require('../../helper/OtpNewHelper');

const Members = model.Members.Get;
const MembersRegister = model.MembersRegister.Get;
const Pins = model.Pins.Get;
const Otp = model.Otp.Get;

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

	const member = await Members.findOne({
		where: {
			mobile_phone: params.mobile_phone,
		},
	});

	if (member) {
		return new ErrorResponse(40104, {
			field: 'Phone Number',
		});
	}

	const memberRegister = await MembersRegister.findOne({
		where: {
			mobile_phone: params.mobile_phone,
		},
	}, {});
	if (memberRegister) {
		// if (memberRegister.status !== 'registered') {
		// const sendOtp = await otpHelper.sendOtp({
		// 	members_register_id: memberRegister.id,
		// }, memberRegister.mobile_phone);

		try {
			const res = await otpNewHelper.sendOtp(memberRegister.mobile_phone, {
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
			mobile_phone: params.mobile_phone,
			status: 'pending',
		};
		const newMember = await MembersRegister.create(payload);
		// const sendOtp = await otpHelper.sendOtp({
		// 	members_register_id: newMember.id,
		// }, newMember.mobile_phone);

		try {
			const res = await otpNewHelper.sendOtp(newMember.mobile_phone, {
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

	const memberRegister = await MembersRegister.findOne({ include: [Otp], where: { mobile_phone: params.mobile_phone, status: 'pending' } });

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


	const memberRegister = await MembersRegister.findOne({ where: { mobile_phone: params.mobile_phone, status: 'pending' } });
	if (memberRegister) {
		const member = await Members.create(params);
		const pin = await Pins.create({ pin: params.pin, members_id: member.id, expired });
		await memberRegister.update({ status: 'registered' });
		const payload = {
			id: member.id,
			oauth: false,
		};
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

		return new Response(20005, accessToken);
	}
	// Error: Member not found
	throw new ErrorResponse(41700);
};

exports.memberDetail = async (request) => {
	const token = await request.jwtVerify();

	const member = await Members.findOne({ attributes: ['full_name', 'email', 'mobile_phone', 'image'], where: { id: token.id } });

	if (member) {
		return new Response(20025, member);
	}

	// Error: Member not found
	throw new ErrorResponse(41700);
};

exports.doPinValidation = async (request) => {
	const token = await request.jwtVerify();
	const params = JSON.parse(JSON.stringify(request.query));

	const pinMember = await Pins.findOne({ attributes: ['pin'], where: { members_id: token.id } });

	if (pinMember) {
		if (bcrypt.compareSync(params.pin.toString(), pinMember.pin)) {
			return new Response(20026, { pin_valid: true });
		}
		return new ErrorResponse(40103);
	}

	// Error: Pin not found
	throw new ErrorResponse(41700);
};
exports.doChangePin = async (request) => {
	const token = await request.jwtVerify();
	const params = JSON.parse(JSON.stringify(request.query));

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
