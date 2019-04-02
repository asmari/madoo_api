const moment = require('moment');
const bcrypt = require('bcrypt');

const model = require('../../models');
const otpHelper = require('../../helper/otpHelper');
const { ErrorResponse, Response } = require('../../helper/response');

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

	const memberRegister = await MembersRegister.findOne({
		where: {
			mobile_phone: params.mobile_phone,
		},
	}, {});
	if (memberRegister) {
		if (memberRegister.status !== 'regitered') {
			const sendOtp = await otpHelper.sendOtp({
				members_register_id: memberRegister.id,
			}, memberRegister.mobile_phone);

			return new Response(sendOtp);
		}

		// Error: Member already registered! Please login
		throw new ErrorResponse(40105);
	} else {
		const payload = {
			full_name: params.full_name,
			email: params.email,
			mobile_phone: params.mobile_phone,
			status: 'pending',
		};
		const newMember = await MembersRegister.create(payload);
		const sendOtp = await otpHelper.sendOtp({
			members_register_id: newMember.id,
		}, newMember.mobile_phone);

		return new Response(sendOtp);
	}
};

exports.doOtpValidation = async (request) => {
	const params = request.body;

	const memberRegister = await MembersRegister.findOne({ include: [Otp], where: { mobile_phone: params.mobile_phone, status: 'pending' } });

	if (memberRegister) {
		const otpCheck = await otpHelper.checkOtp({
			members_register_id: memberRegister.id,
		}, params.otp);

		return new Response(20020, otpCheck);
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
	const params = JSON.parse(JSON.stringify(request.query));

	const member = await Members.findOne({ attributes: ['full_name', 'email', 'mobile_phone', 'image'], where: { id: params.member_id } });

	if (member) {
		return new Response(20025, member);
	}

	// Error: Member not found
	throw new ErrorResponse(40400);
};
