const bcrypt = require('bcrypt');

const model = require('../../models');
const otpHelper = require('../../helper/otpHelper');
const helper = require('../../helper');
const { sequelize } = require('../../models/conn/sequelize');

const Members = model.Members.Get;
const MembersRegister = model.MembersRegister.Get;
const Pins = model.Pins.Get;

// register fb oauth
exports.doRegisterFacebook = async (request, reply) => {
	try {
		let params = request.raw.body || request.body;

		params = params || {};

		if (!Object.prototype.hasOwnProperty.call(params, 'full_name')) {
			return reply.send(helper.Fail({
				message: 'Field full_name is required',
			}));
		}

		if (!Object.prototype.hasOwnProperty.call(params, 'email')) {
			return reply.send(helper.Fail({
				message: 'Field email is required',
			}));
		}

		if (!Object.prototype.hasOwnProperty.call(params, 'mobile_phone')) {
			return reply.send(helper.Fail({
				message: 'Field mobile_phone is required',
			}));
		}

		if (!Object.prototype.hasOwnProperty.call(params, 'fb_id')) {
			return reply.send(helper.Fail({
				message: 'Field fb_id is required',
			}));
		}

		if (!Object.prototype.hasOwnProperty.call(params, 'fb_token')) {
			return reply.send(helper.Fail({
				message: 'Field fb_token is required',
			}));
		}

		if (!Object.prototype.hasOwnProperty.call(params, 'pin')) {
			return reply.send(helper.Fail({
				message: 'Field pin is required',
			}));
		}


		const fingerprint = Object.prototype.hasOwnProperty.call(params, 'fingerprint') ? params.fingerprint : 0;
		const image = Object.prototype.hasOwnProperty.call(params, 'image') ? params.image : null;

		// start transaction
		return sequelize.transaction(async () => {
			// find email unique
			Members.findOne({
				where: {
					email: params.email,
				},
			}).then((member) => {
				if (member != null) {
					return Promise.reject(new Error('Email already registered'));
				}

				// find phone unique
				return Members.findOne({
					where: {
						mobile_phone: params.mobile_phone,
					},
				});
			}).then(async (member) => {
				if (member != null) {
					return Promise.reject(new Error('Phone number already registered'));
				}

				// create member
				const exists = await MembersRegister
					.findOne({
						where: {
							mobile_phone: params.mobile_phone,
							status: 'pending',
						},
					});

				if (exists != null) {
					return exists;
				}

				return MembersRegister.create({
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
			}).then(members => otpHelper.sendOtp({
				members_register_id: members.id,
			}, params.mobile_phone));
			// .then(() => {

			//     //create pin for member
			//     return Pins.create({
			//         members_id: members.id,
			//         token:0,
			//         expired:new Date(),
			//         wrong:0,
			//         pin: hash}, { transaction: t }).then(pins => {
			//             return Members.findByPk(pins.member_id);
			//         })
			// });
		}).then(async () => {
			const payload = params;
			payload.image = image;
			payload.fingerprint = fingerprint;

			return reply.send(helper.Success(payload));
		}).catch(err => reply.code(500).send(helper.Fail(err)));
	} catch (err) {
		return reply.code(500).send(helper.Fail(err));
	}
};

// check otp facebook oauth
exports.doCheckOtp = async (request, reply) => {
	try {
		const { body } = request;

		const member = await MembersRegister.findOne({
			where: {
				mobile_phone: body.mobile_phone,
				email: body.email,
				fb_id: body.fb_id,
			},
		});

		if (member != null) {
			const { status, message } = await otpHelper.checkOtp(body.otp, {
				members_register_id: member.id,
			});

			if (status) {
				return reply.send(helper.Success({
					otp_status: status,
				}, message));
			}
			return reply.send(helper.Fail({
				message,
			}));
		}
		throw new Error('Member not found');
	} catch (err) {
		return reply.send(helper.Fail(err));
	}
};

// do save member with facebook
exports.doSaveMember = async (request, reply) => {
	try {
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

			// console.log(payload);

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
				return reply.send(helper.Success({
					token_type: 'Bearer',
					access_token: token,
					fingerprint: member.finggerprint || 0,
				}));
			}
			throw new Error('Token is null');
		}

		throw new Error('Member register not found');
	} catch (err) {
		return reply.send(helper.Fail(err));
	}
};

// login check against facebook oauth
exports.doLoginFacebook = async (request, reply) => {
	try {
		const params = request.body;

		if (!Object.prototype.hasOwnProperty.call(params, 'email')) {
			throw new Error('Field email is required');
		}

		if (!Object.prototype.hasOwnProperty.call(params, 'fb_id')) {
			throw new Error('Field fb_id is required');
		}

		if (!Object.prototype.hasOwnProperty.call(params, 'fb_token')) {
			throw new Error('Field fb_token is required');
		}

		return Members.findOne({
			where: {
				email: params.email,
				fb_id: params.fb_id,
			},
		}).then((member) => {
			if (member == null) {
				return reply.code(200).send(helper.Fail({
					message: 'Member is not found',
					statusCode: 404,
				}));
			}

			// update fb_token using latest token received
			return member.update({
				fb_token: params.fb_token,
			}).then(async () => {
				const payload = {
					id: member.id,
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
							fingerprint: member.finggerprint,
						});
					});
				});

				return reply.send(helper.Success(token));
			});
		}).catch(err => reply.code(500).send(helper.Fail(err)));
	} catch (err) {
		return reply.code(500).send(helper.Fail(err));
	}
};
