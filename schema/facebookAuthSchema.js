exports.facebookLoginSchema = {
	schema: {
		description: 'Rest API for login with facebook',
		body: {
			// Required body paramter for login
			required: ['email', 'fb_id', 'fb_token'],
			properties: {
				email: { type: 'string' },
				fb_id: { type: 'string' },
				fb_token: { type: 'string' },
			},
		},
	},
};

exports.facebookSaveMemberSchema = {
	schema: {
		description: 'Rest API for register user & auto login',
		body: {
			required: ['full_name', 'email', 'mobile_phone', 'pin', 'fb_id', 'fb_token'],
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
					type: 'boolean',
					default: false,
				},
				fb_id: {
					type: 'string',
				},
				fb_token: {
					type: 'string',
				},
			},
		},
	},
};

exports.facebookOtpSchema = {
	schema: {
		description: 'Rest API for validate otp register with facebook',
		body: {
			type: 'object',
			required: ['otp', 'mobile_phone', 'fb_id', 'fb_token', 'email'],
			properties: {
				email: {
					type: 'string',
				},
				fb_id: {
					type: 'string',
				},
				fb_token: {
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

exports.facebookRegisterSchema = {
	schema: {
		consumes: ['multipart/form-data'],
		description: 'Rest API for validate user & send otp',
		body: {
			required: ['full_name', 'email', 'fb_id', 'fb_token', 'mobile_phone'],
			properties: {
				full_name: { type: 'string' },
				email: { type: 'string' },
				fb_id: { type: 'string' },
				fb_token: { type: 'string' },
				mobile_phone: { type: 'string' },
			},
		},
	},
};
