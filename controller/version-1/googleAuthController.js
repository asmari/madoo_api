// const { resolve } = require('path');
const bcrypt = require('bcrypt');

const model = require('../../models');
const OtpNewHelper = require('../../helper/OtpNewHelper');
const { ErrorResponse, Response } = require('../../helper/response');

const Members = model.Members.Get;
const MembersRegister = model.MembersRegister.Get;
const Pins = model.Pins.Get;

// register google oauth
exports.doRegisterGoogle = async (request) => {
	const params = request.body;
	const otpNewHelper = new OtpNewHelper();

	if (!Object.prototype.hasOwnProperty.call(params, 'full_name')) {
		// Error: Required field :field
		throw new ErrorResponse(42200, {
			field: 'full_name',
		});
	}

	if (!Object.prototype.hasOwnProperty.call(params, 'email')) {
		// Error: Required field :field
		throw new ErrorResponse(42200, {
			field: 'email',
		});
	}

	if (!Object.prototype.hasOwnProperty.call(params, 'mobile_phone')) {
		// Error: Required field :field
		throw new ErrorResponse(42200, {
			field: 'mobile_phone',
		});
	}

	if (!Object.prototype.hasOwnProperty.call(params, 'g_id')) {
		// Error: Required field :field
		throw new ErrorResponse(42200, {
			field: 'g_id',
		});
	}

	if (!Object.prototype.hasOwnProperty.call(params, 'g_token')) {
		// Error: Required field :field
		throw new ErrorResponse(42200, {
			field: 'g_token',
		});
	}

	// if (!Object.prototype.hasOwnProperty.call(params, 'pin')) {
	// 	// Error: Required field :field
	// 	throw new ErrorResponse(42200, {
	// 		field: 'pin',
	// 	});
	// }

	// const hash = bcrypt.hashSync(params.pin.toString(), 10);

	// find email unique
	const memberEmail = await Members.findOne({
		where: {
			email: params.email,
		},
	});

	if (memberEmail != null) {
		// Error: :field already registered
		throw new ErrorResponse(40104, {
			field: 'Email',
		});
	}

	const memberPhone = await Members.findOne({
		where: {
			mobile_phone: params.mobile_phone,
		},
	});

	if (memberPhone != null) {
		// Error: :field already registered
		throw new ErrorResponse(40104, {
			field: 'Phone number',
		});
	}

	// create member
	let exists = await MembersRegister
		.findOne({
			where: {
				mobile_phone: params.mobile_phone,
				status: 'pending',
			},
		});

	if (exists === null) {
		exists = await MembersRegister.create({
			full_name: params.full_name,
			email: params.email,
			g_id: params.g_id,
			g_token: params.g_token,
			mobile_phone: params.mobile_phone,
			status: 'pending',
		});
	}

	// await otpHelper.sendOtp({
	// 	members_register_id: exists.id,
	// }, params.mobile_phone);

	try {
		await otpNewHelper.sendOtp(params.mobile_phone, {
			type: 'otp',
			data: {
				memberId: exists.id,
			},
		});

		const payload = params;

		return new Response(20007, payload);
	} catch (err) {
		return new ErrorResponse(40111, {
			time: '1 x 24 hour',
		});
	}
};

// do save member with google
exports.doSaveMember = async (request, reply) => {
	const params = request.body;
	const date = new Date();

	const pin = bcrypt.hashSync(params.pin.toString(), 10);

	const memberRegister = await MembersRegister.findOne({
		where: {
			email: params.email,
			mobile_phone: params.mobile_phone,
			status: 'pending',
		},
	});

	if (memberRegister != null) {
		const member = await Members.create({
			...params,
			g_id: params.g_id,
			g_token: params.g_token,
		});

		await Pins.create({
			pin,
			members_id: member.id,
			expired: date,
		});

		await memberRegister.update({
			status: 'registered',
		});

		const payload = {
			id: member.id,
			oauth: true,
		};

		const token = await new Promise((resolve, reject) => {
			reply.jwtSign(payload, (err, accessToken) => {
				if (err) {
					reject(err);
				} else {
					resolve(accessToken);
				}
			});
		});

		if (token != null) {
			return new Response(20005, {
				token_type: 'Bearer',
				access_token: token,
				fingerprint: member.finggerprint,
				members_id: member.id,
			});
		}
		// Error: token is null
		throw new ErrorResponse(41702);
	}

	// Error: member register not found
	throw new ErrorResponse(41703);
};

// login check against google oauth
exports.doLoginGoogle = async (request, reply) => {
	const params = request.body;

	if (!Object.prototype.hasOwnProperty.call(params, 'email')) {
		// Error: Required field :field
		throw new ErrorResponse(42200, {
			field: 'email',
		});
	}

	if (!Object.prototype.hasOwnProperty.call(params, 'g_id')) {
		// Error: Required field :field
		throw new ErrorResponse(42200, {
			field: 'g_id',
		});
	}

	if (!Object.prototype.hasOwnProperty.call(params, 'g_token')) {
		// Error: Required field :field
		throw new ErrorResponse(42200, {
			field: 'g_token',
		});
	}

	const member = await Members.findOne({
		where: {
			email: params.email,
			g_id: params.g_id,
		},
	});

	if (member == null) {
		throw new ErrorResponse(41700);
	}

	// update g_token using latest token received
	const memberUpdate = await member.update({
		g_token: params.g_token,
	});

	const payload = {
		id: memberUpdate.id,
		oauth: true,
	};

	const resotp = new Promise((resolve, reject) => {
		reply.jwtSign(payload, (err, token) => {
			if (err) {
				reject(err);
			}
			const res = {
				token_type: 'Bearer',
				access_token: token,
				fingerprint: memberUpdate.finggerprint,
			};

			resolve(res);
		});
	});

	return new Response(20010, resotp);
};
