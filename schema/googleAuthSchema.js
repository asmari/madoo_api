exports.googleLoginSchema = {
	schema: {
		description: 'Rest API for login with google',
		body: {
			// Required body paramter for login
			required: ['email', 'g_id', 'g_token'],
			properties: {
				email: { type: 'string' },
				g_id: { type: 'string' },
				g_token: { type: 'string' },
			},
		},
	},
};

exports.googleRegisterSchema = {
	schema: {
		consumes: ['multipart/form-data'],
		description: 'Rest API for validate user & send otp',
		body: {
			required: ['full_name', 'email', 'g_id', 'g_token', 'mobile_phone'],
			properties: {
				full_name: { type: 'string' },
				email: { type: 'string' },
				g_id: { type: 'string' },
				g_token: { type: 'string' },
				mobile_phone: {
					type: 'string',
					maxLength: 20,
					minLength: 9,
				},
			},
		},
	},
};

exports.googleSaveMemberSchema = {
	schema: {
		description: 'Rest API for register user & auto login',
		body: {
			required: ['full_name', 'email', 'mobile_phone', 'pin', 'g_id', 'g_token'],
			properties: {
				full_name: {
					type: 'string',
					maxLength: 50,
					minLength: 3,
				},
				email: {
					type: 'string',
					maxLength: 50,
					minLength: 3,
				},
				mobile_phone: {
					type: 'string',
					maxLength: 20,
					minLength: 9,
				},
				pin: {
					type: 'integer',
					maxLength: 6,
					minLength: 6,
				},
				fingerprint: {
					type: 'integer',
					default: 0,
				},
				g_id: {
					type: 'string',
				},
				g_token: {
					type: 'string',
				},
			},
		},
	},
};

exports.googleOtpSchema = {
	schema: {
		description: 'Rest API for validate otp register with google',
		body: {
			type: 'object',
			required: ['otp', 'mobile_phone', 'g_id', 'g_token', 'email'],
			properties: {
				email: {
					type: 'string',
				},
				g_id: {
					type: 'string',
				},
				g_token: {
					type: 'string',
				},
				otp: {
					type: 'integer',
				},
				mobile_phone: {
					type: 'string',
				},
			},
		},
	},
};
