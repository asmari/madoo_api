exports.registerSchema = {
	schema: {
		body: {
			// Required body paramter for register
			required: ['full_name', 'email', 'mobile_phone'],
			properties: {
				full_name: { type: 'string', maxLength: 50, minLength: 3 },
				email: { type: 'string', maxLength: 50, minLength: 3 },
				mobile_phone: { type: 'string', maxLength: 18, minLength: 11 },

			},
		},
	},
};
exports.otpSchema = {
	schema: {
		body: {
			// Required body paramter for register
			required: ['mobile_phone', 'otp'],
			properties: {
				mobile_phone: { type: 'string', maxLength: 18, minLength: 11 },
				otp: { type: 'integer', maxLength: 6, minLength: 6 },

			},
		},
	},
};

exports.memberSchema = {
	schema: {
		body: {
			// Required body paramter for save member
			required: ['full_name', 'email', 'mobile_phone', 'pin'],
			properties: {
				full_name: { type: 'string', maxLength: 50, minLength: 3 },
				email: { type: 'string', maxLength: 50, minLength: 3 },
				mobile_phone: { type: 'string', maxLength: 18, minLength: 11 },
				pin: { type: 'integer', maxLength: 6, minLength: 6 },
				fingerprint: { type: 'integer' },
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
		querystring: {
			type: 'object',
			properties: {
				pin: {
					type: 'integer',
				},
			},
			required: ['pin'],
		},
	},
};
