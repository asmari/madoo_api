exports.registerSchema = {
	schema: {
		security: [
			{
				'skip-auth': [],
			},
		],
		description: 'Rest API for check user and sent OTP',
		body: {
			// Required body paramter for register
			required: ['full_name', 'email', 'mobile_phone'],
			properties: {
				full_name: { type: 'string', maxLength: 50 },
				email: { type: 'string' },
				mobile_phone: { type: 'string', maxLength: 20, minLength: 9 },

			},
		},
	},
};
exports.otpSchema = {
	schema: {
		security: [
			{
				'skip-auth': [],
			},
		],
		description: 'Rest API for user validate otp',
		body: {
			// Required body paramter for register
			required: ['mobile_phone', 'otp'],
			properties: {
				mobile_phone: { type: 'string', maxLength: 20, minLength: 9 },
				otp: { type: 'integer', maxLength: 6, minLength: 6 },

			},
		},
	},
};

exports.memberSchema = {
	schema: {
		security: [
			{
				'skip-auth': [],
			},
		],
		description: 'Rest API for register user and auto login',
		body: {
			// Required body paramter for save member
			required: ['full_name', 'email', 'mobile_phone', 'pin'],
			properties: {
				full_name: { type: 'string', maxLength: 50, minLength: 3 },
				email: { type: 'string', maxLength: 50, minLength: 3 },
				mobile_phone: { type: 'string', maxLength: 20, minLength: 9 },
				pin: { type: 'string', maxLength: 6, minLength: 6 },
				fingerprint: { type: 'integer', default: 0 },
			},
		},
	},
};
exports.memberDetailSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
	},
};

exports.pinValidationSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		description: 'Rest API for validate pin',
		body: {
			properties: {
				pin: {
					type: 'string',
				},
			},
			required: ['pin'],
		},
	},
};

exports.changePinSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		description: 'Rest API for chagnge pin',
		body: {
			properties: {
				old_pin: {
					type: 'string',
				},
				new_pin: {
					type: 'string', maxLength: 6, minLength: 6,
				},
				confirm_pin: {
					type: 'string', maxLength: 6, minLength: 6,
				},
			},
			required: ['old_pin', 'new_pin', 'confirm_pin'],
		},
	},
};
exports.updateMemberSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		description: 'Rest API for update member without phone number',
		body: {
			properties: {
				full_name: {
					type: 'string', maxLength: 50, minLength: 3,
				},
				email: {
					type: 'string', format: 'email',
				},
				mobile_phone: {
					type: 'string', maxLength: 20, minLength: 9,
				},
			},
			required: ['full_name'],
		},
	},
};

exports.sendOtpUpdateSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		description: 'Rest API for send otp when update phone number',
		body: {
			properties: {
				mobile_phone: {
					type: 'string',
				},
				country_code: {
					type: 'string',
				},
			},
			required: ['mobile_phone'],
		},
	},
};

exports.checkOtpUpdateSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		description: 'Rest API for check otp update phone number',
		body: {
			properties: {
				mobile_phone: {
					type: 'string',
				},
				country_code: {
					type: 'string',
				},
				otp: {
					type: 'string',
					maxLength: 6,
					minLength: 6,
				},
			},
			required: [
				'otp',
				'mobile_phone',
			],
		},
	},
};

exports.verificationEmail = {
	schema: {
		description: 'Rest Api Verify Email',
		querystring: {
			type: 'object',
			properties: {
				token: {
					type: 'string',
				},
			},
			required: [
				'token',
			],
		},
	},
};
