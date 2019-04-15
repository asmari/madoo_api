const bcrypt = require('bcrypt');

const { ErrorResponse, Response } = require('../../helper/response');
const model = require('../../models');
const otpHelper = require('../../helper/otpHelper');

const Members = model.Members.Get;
const MembersRegister = model.MembersRegister.Get;
const Pins = model.Pins.Get;

// register fb oauth
exports.doRegisterFacebook = async (request) => {
	const params = request.body;

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

	if (!Object.prototype.hasOwnProperty.call(params, 'fb_id')) {
		// Error: Required field :field
		throw new ErrorResponse(42200, {
			field: 'fb_id',
		});
	}

	if (!Object.prototype.hasOwnProperty.call(params, 'fb_token')) {
		// Error: Required field :field
		throw new ErrorResponse(42200, {
			field: 'fb_token',
		});
	}

	if (!Object.prototype.hasOwnProperty.call(params, 'pin')) {
		// Error: Required field :field
		throw new ErrorResponse(42200, {
			field: 'pin',
		});
	}

	const fingerprint = Object.prototype.hasOwnProperty.call(params, 'fingerprint') ? params.fingerprint : 0;
	const image = Object.prototype.hasOwnProperty.call(params, 'image') ? params.image : null;

	// find email unique
	const memberEmail = await Members.findOne({
		where: {
			email: params.email,
		},
	});

	if (memberEmail != null) {
		// Error: :field already registered!
		throw new ErrorResponse(40104, {
			field: 'Email',
		});
	}

	// find phone unique
	const memberPhone = await Members.findOne({
		where: {
			mobile_phone: params.mobile_phone,
		},
	});

	if (memberPhone != null) {
		// Error: :field already registered!
		throw new ErrorResponse(40104, {
			field: 'Phone',
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

	if (exists == null) {
		exists = await MembersRegister.create({
			full_name: params.full_name,
			email: params.email,
			fb_id: params.fb_id,
			fb_token: params.fb_token,
			mobile_phone: params.mobile_phone,
			pin: params.pin,
			finggerprint: fingerprint,
			image,
			status: 'pending',
		});
	}

	await otpHelper.sendOtp({
		members_register_id: exists.id,
	}, params.mobile_phone);

	const payload = params;
	payload.image = image;
	payload.fingerprint = fingerprint;

	return new Response(20004, payload);
};

// do save member with facebook
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
			fb_id: memberRegister.fb_id,
			fb_token: memberRegister.fb_token,
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
				fingerprint: member.finggerprint || 0,
			});
		}

		// Error: Token is null
		throw new ErrorResponse(41702);
	}

	// Error: Member register not found
	throw new ErrorResponse(41703);
};

// login check against facebook oauth
exports.doLoginFacebook = async (request, reply) => {
	const params = request.body;

	if (!Object.prototype.hasOwnProperty.call(params, 'email')) {
		// Error: Required field :field
		throw new ErrorResponse(42200, {
			field: 'email',
		});
	}

	if (!Object.prototype.hasOwnProperty.call(params, 'fb_id')) {
		// Error: Required field :field
		throw new ErrorResponse(42200, {
			field: 'fb_id',
		});
	}

	if (!Object.prototype.hasOwnProperty.call(params, 'fb_token')) {
		// Error: Required field :field
		throw new ErrorResponse(42200, {
			field: 'fb_token',
		});
	}

	const member = await Members.findOne({
		where: {
			email: params.email,
			fb_id: params.fb_id,
		},
	});

	if (member == null) {
		// Error: Member not found
		throw new ErrorResponse(41700);
	}

	// update fb_token using latest token received
	const memberUpdate = await member.update({
		fb_token: params.fb_token,
	});

	const payload = {
		id: memberUpdate.id,
		oauth: true,
	};

	const token = await new Promise((resolve, reject) => {
		reply.jwtSign(payload, (err, accessToken) => {
			if (err) {
				reject(err);
			}
			resolve({
				token_type: 'Bearer',
				access_token: accessToken,
				fingerprint: memberUpdate.finggerprint,
				members_id: member.id,
			});
		});
	});

	return new Response(20006, token);
};
