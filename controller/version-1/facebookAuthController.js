const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

const { ErrorResponse, Response } = require('../../helper/response');
const model = require('../../models');
const OtpNewHelper = require('../../helper/OtpNewHelper');

const Members = model.Members.Get;
const MembersToken = model.MembersToken.Get;
const MembersRegister = model.MembersRegister.Get;
const Pins = model.Pins.Get;
const NotificationSettings = model.NotificationSettings.Get;
const UpdateMemberLogs = model.UpdateMemberLogs.Get;

// register fb oauth
exports.doRegisterFacebook = async (request) => {
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

	// if (!Object.prototype.hasOwnProperty.call(params, 'pin')) {
	// 	// Error: Required field :field
	// 	throw new ErrorResponse(42200, {
	// 		field: 'pin',
	// 	});
	// }

	// find email unique
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

	if (memberEmail != null) {
		// Error: :field already registered!
		throw new ErrorResponse(40113);
	}

	// find phone unique
	const memberPhone = await Members.findOne({
		paranoid: false,
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
			fb_name: params.full_name,
			fb_email: params.email,
			g_email: '-',
			mobile_phone: params.mobile_phone,
			// pin: params.pin,
			status: 'pending',
		});
	} else {
		await exists.update({
			full_name: params.full_name,
			email: params.email,
			fb_id: params.fb_id,
			fb_token: params.fb_token,
			fb_name: params.full_name,
			fb_email: params.email,
			g_email: '-',
			mobile_phone: params.mobile_phone,
			// pin: params.pin,
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

		return new Response(20004, payload);
	} catch (err) {
		return new ErrorResponse(40111, {
			time: '1 x 24 hour',
		});
	}
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
			fb_email: memberRegister.fb_email,
			g_email: '-',
			fb_name: params.full_name,
		});

		await UpdateMemberLogs.create({
			type: 'email',
			members_id: member.id,
			value_before: member.email,
			value_after: member.email,
			is_verified: 0,
		});

		await Pins.create({
			pin,
			members_id: member.id,
			expired: date,
		});

		await memberRegister.update({
			status: 'registered',
		});

		await NotificationSettings.create({
			members_id: member.id,
			promotion: 1,
			conversion: 1,
			other: 1,
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

		const memberToken = await MembersToken.findOne({
			where: {
				members_id: member.id,
			},
			paranoid: false,
		});

		if (memberToken !== null) {
			await memberToken.restore();
			await memberToken.update({
				token,
			});
		} else {
			await MembersToken.create({
				members_id: member.id,
				token,
			});
		}

		if (token != null) {
			return new Response(20005, {
				token_type: 'Bearer',
				access_token: token,
				fingerprint: member.finggerprint,
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
		paranoid: false,
	});

	if (member == null) {
		// Error: Member not found
		throw new ErrorResponse(41700);
	}

	if (member.deleted_at != null) {
		throw new ErrorResponse(40112);
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

	const memberToken = await MembersToken.findOne({
		where: {
			members_id: member.id,
		},
		paranoid: false,
	});

	if (memberToken !== null) {
		await memberToken.restore();
		await memberToken.update({
			token: token.access_token,
		});
	} else {
		await MembersToken.create({
			members_id: member.id,
			token: token.access_token,
		});
	}

	return new Response(20006, token);
};
