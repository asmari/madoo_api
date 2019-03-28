const bcrypt = require('bcrypt');
const model = require('../../models');
const helper = require('../../helper');
const otpHelper = require('../../helper/otpHelper');


const Members = model.Members.Get;
const Pins = model.Pins.Get;

// Index Auth member
exports.authIndex = async (request, reply) => reply.send({ status: true });

// Procss check member if exists by phone number and country code
exports.doCheckMember = (request, reply) => {
	try {
		const params = request.body;

		if (!Object.prototype.hasOwnProperty.call(params, 'mobile_phone')) {
			throw new Error('Field mobile_phone is required');
		}

		return Members.findOne({
			where: {
				mobile_phone: params.mobile_phone,
			},
		}).then((member) => {
			if (member != null) {
				return reply.send(helper.Success({
					user_exist: true,
				}));
			}
			return reply.send(helper.Success({
				user_exist: false,
			}));
		}).catch((err) => {
			throw err;
		});
	} catch (err) {
		return reply.code(500).send(helper.Fail(err, 500));
	}
};

// Process login member
exports.doLogin = (request, reply) => {
	try {
		const params = request.body;

		if (!Object.prototype.hasOwnProperty.call(params, 'mobile_phone')) {
			throw new Error('Field mobile_phone is required');
		}

		if (!Object.prototype.hasOwnProperty.call(params, 'pin')) {
			throw new Error('Field pin is required');
		}

		Members.findOne({
			where: {
				mobile_phone: params.mobile_phone,
			},
			include: [Pins],
		}).then((member) => {
			if (member == null) {
				reply.send(helper.Fail({
					message: 'Member not found',
					statusCode: 404,
				}));
			}

			const pin = member.pin_member;


			if (bcrypt.compareSync(params.pin, pin.pin)) {
				const payload = {
					id: member.id,
					oauth: false,
				};

				reply.jwtSign(payload, (err, token) => {
					if (err) {
						reply.code(200).send(helper.Fail(err));
					}
					const res = {
						token_type: 'Bearer',
						access_token: token,
						fingerprint: member.finggerprint,
					};
					reply.code(200).send(helper.Success(res));
				});
			} else {
				reply.code(500).send(helper.Fail({
					message: 'Pin member is not valid',
				}, 500));
			}
		});
	} catch (err) {
		reply.code(200).send(helper.Fail(err));
	}
};

// forgot pin otp
exports.setForgotPinOtp = async (request, reply) => {
	try {
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

			reply.send(helper.Success(resOtp));
		}

		throw new Error('Member not found');
	} catch (err) {
		reply.send(helper.Fail(err));
	}
};

// check forgot pin otp
exports.checkForgotPinOtp = async (request, reply) => {
	try {
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

			reply.send(helper.Success(resOtp));
		}

		throw new Error('Member not found');
	} catch (err) {
		reply.send(helper.Fail(err));
	}
};


// change forgot pin
exports.doChangePin = async (request, reply) => {
	try {
		const params = request.body;

		if (params.pin !== params.confirm_pin) {
			reply.send(helper.Fail({
				message: 'Pin not same with confirm pin',
				statusCode: 500,
			}));
		}

		if (params.pin.toString().length > 6 || params.pin.toString().length < 6) {
			reply.send(helper.Fail({
				message: 'Pin length must be 6',
				statusCode: 500,
			}));
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

					resolve(helper.Success(response));
				});
			});

			reply.send(res);
		}

		throw new Error('Member not found');
	} catch (err) {
		reply.send(helper.Fail(err));
	}
};
