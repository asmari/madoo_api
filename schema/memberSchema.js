exports.registerSchema = {
	schema: {
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
			},
		],
	},
};

exports.pinValidationSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
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
			},
		],
		description: 'Rest API for update member without phone number',
		querystring: {
			type: 'object',
			properties: {
				full_name: {
					type: 'string', maxLength: 50, minLength: 3,
				},
				email: {
					type: 'string', format: 'email',
				},
			},
			required: ['full_name', 'email'],
		},
	},
};
