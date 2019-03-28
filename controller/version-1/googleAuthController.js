// const { resolve } = require('path');
const bcrypt = require('bcrypt');

const model = require('../../models');
const helper = require('../../helper');
const { sequelize } = require('../../models/conn/sequelize');
const otpHelper = require('../../helper/otpHelper');

const Members = model.Members.Get;
const MembersRegister = model.MembersRegister.Get;
const Pins = model.Pins.Get;

// register google oauth
exports.doRegisterGoogle = (request, reply) => {
	try {
		let params = request.raw.body || request.body;

		params = params || {};

		// let raws = request.raw.files || {}


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

		if (!Object.prototype.hasOwnProperty.call(params, 'g_id')) {
			return reply.send(helper.Fail({
				message: 'Field g_id is required',
			}));
		}

		if (!Object.prototype.hasOwnProperty.call(params, 'g_token')) {
			return reply.send(helper.Fail({
				message: 'Field g_token is required',
			}));
		}

		if (!Object.prototype.hasOwnProperty.call(params, 'pin')) {
			return reply.send(helper.Fail({
				message: 'Field pin is required',
			}));
		}


		const fingerprint = Object.prototype.hasOwnProperty.call(params, 'fingerprint') ? params.fingerprint : 0;
		const image = Object.prototype.hasOwnProperty.call(params, 'image') ? params.image : null;

		// const hash = bcrypt.hashSync(params.pin.toString(), 10);

		// start transaction
		return sequelize.transaction(async () => {
			// find email unique
			const member = await Members.findOne({
				where: {
					email: params.email,
				},
			});
			if (member != null) {
				return Promise.reject(new Error({
					message: 'Email already registered',
				}));
			}
			const memberSatu = await Members.findOne({
				where: {
					mobile_phone: params.mobile_phone,
				},
			});
			if (memberSatu != null) {
				return Promise.reject(new Error({
					message: 'Phone number already registered',
				}));
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
			const members = await MembersRegister.create({
				full_name: params.full_name,
				email: params.email,
				g_id: params.g_id,
				g_token: params.g_token,
				mobile_phone: params.mobile_phone,
				pin: params.pin,
				finggerprint: fingerprint,
				image,
				status: 'pending',
			});
			return otpHelper.sendOtp({
				members_register_id: members.id,
			}, params.mobile_phone);
			// .then(() => members),

			// create pin for member
			// return Pins.create({
			//     members_id: members.id,
			//     token:0,
			//     expired:new Date(),
			//     wrong:0,
			//     pin: hash}, { transaction: t }).then(pins => {
			//         return Members.findByPk(pins.member_id);
			//     })
			// );
		}).then(async () => {
			const payload = params;
			payload.image = image;
			payload.fingerprint = fingerprint;

			// if image exist, upload to file
			/* upload system disabled until further notice */
			// if(raws.hasOwnProperty("image")){

			//     let _imageTemp = raws.image

			//     const ext = _imageTemp.name.split('.').pop()
			//     const imageName = Math.random().toString(13).replace('0.', '') + "." + ext

			//     _imageTemp.mv(resolve("upload/" + imageName), (err) => {

			//         if(err){
			//             reply.send(helper.Fail({
			//                 message:"Image upload failed"
			//             }))
			//         }else{

			//             member.update({
			//                 image: imageName
			//             })

			//             payload.image = imageName
			//             reply.send(helper.Success(payload))
			//         }

			//     })

			//     return
			// }

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
				g_id: body.g_id,
			},
		});

		if (member != null) {
			const { status, message } = await otpHelper.checkOtp(body.otp, {
				members_register_id: member.id,
			});

			if (status) {
				reply.send(helper.Success({
					otp_status: status,
				}, message));
			} else {
				reply.send(helper.Fail({
					message,
				}));
			}
		} else {
			throw new Error({
				message: 'Member not found',
				statusCode: 404,
			});
		}
	} catch (err) {
		reply.send(helper.Fail(err));
	}
};

// do save member with google
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
				g_id: memberRegister.g_id,
				g_token: memberRegister.g_token,
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
				reply.send(helper.Success({
					token_type: 'Bearer',
					access_token: token,
					fingerprint: member.finggerprint || 0,
				}));
			}
			throw new Error({
				message: 'Token is null',
				statusCode: 5000,
			});
		}

		throw new Error({
			message: 'Member register not found',
			statusCode: 404,
		});
	} catch (err) {
		reply.send(helper.Fail(err));
	}
};

// login check against google oauth
exports.doLoginGoogle = (request, reply) => {
	try {
		const params = request.body;

		if (!Object.prototype.hasOwnProperty.call(params, 'email')) {
			throw new Error('Field email is required');
		}

		if (!Object.prototype.hasOwnProperty.call(params, 'g_id')) {
			throw new Error('Field g_id is required');
		}

		if (!Object.prototype.hasOwnProperty.call(params, 'g_token')) {
			throw new Error('Field g_token is required');
		}

		Members.findOne({
			where: {
				email: params.email,
				g_id: params.g_id,
			},
		}).then((member) => {
			if (member == null) {
				reply.code(200).send(helper.Fail({
					message: 'Member is not found',
					statusCode: 404,
				}));
			}

			// update g_token using latest token received
			member.update({
				g_token: params.g_token,
			}).then(() => {
				const payload = {
					id: member.id,
					oauth: true,
				};

				reply.jwtSign(payload, (err, token) => {
					if (err) {
						reply.send(helper.Fail(err));
					}
					const res = {
						token_type: 'Bearer',
						access_token: token,
						fingerprint: member.finggerprint,
					};

					reply.send(helper.Success(res));
				});
			});
		});
	} catch (err) {
		reply.code(500).send(helper.Fail(err));
	}
};
