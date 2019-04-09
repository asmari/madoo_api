const bcrypt = require('bcrypt');
const model = require('../../models');
const helper = require('../../helper');
const otpHelper = require('../../helper/otpHelper');
const { ErrorResponse, Response } = require('../../helper/response');

const Members = model.Members.Get;
const Pins = model.Pins.Get;

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
	});

	if (member) {
		return new Response(200, {
			user_exists: true,
		});
	}

	return new Response(200, {
		user_exists: false,
	});
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
		include: [Pins],
	});

	if (member == null) {
		// Error: Member not found
		throw new ErrorResponse(41700);
	}

	const pin = member.pin_member;

	if (bcrypt.compareSync(params.pin, pin.pin)) {
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
					members_id: member.id,
				};
				resolve(res);
			});
		});

		return new Response(20000, accessToken);
	}
	// Error: Pin member is not valid
	throw new ErrorResponse(40103);
};

// forgot pin otp
exports.setForgotPinOtp = async (request) => {
	const params = request.body;

	const member = await Members.findOne({
		where: {
			mobile_phone: params.mobile_phone,
		},
	});

	if (member) {
		const resOtp = await otpHelper.forgotPinOtp({
			members_id: member.id,
		}, params.mobile_phone);

		return new Response(20001, resOtp);
	}

	// Error: Member not found
	throw new ErrorResponse(41700);
};

// check forgot pin otp
exports.checkForgotPinOtp = async (request) => {
	const params = request.body;

	const member = await Members.findOne({
		where: {
			mobile_phone: params.mobile_phone,
		},
	});

	if (member) {
		const resOtp = await otpHelper.forgotCheckOtp({
			members_id: member.id,
		}, params.otp);

		return new Response(20002, resOtp);
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
			});
		}

		const isOauth = !!(member.fb_id != null || member.g_id != null);

		const payload = {
			id: member.id,
			oauth: isOauth,
		};

		const res = await new Promise((resolve, reject) => {
			reply.jwtSign(payload, (err, token) => {
				if (err) {
					reject(helper.Fail(err));
				}
				const response = {
					token_type: 'Bearer',
					access_token: token,
					fingerprint: member.finggerprint,
				};

				resolve(response);
			});
		});

		return new Response(res);
	}

	// Error: Member not found
	throw new ErrorResponse(41700);
};
