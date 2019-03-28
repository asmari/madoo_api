exports.facebookLoginSchema = {
	schema: {
		body: {
			// Required body paramter for login
			required: ['email', 'fb_id', 'fb_token'],
			properties: {
				email: { type: 'string' },
				fb_id: { type: 'integer' },
				fb_token: { type: 'integer' },
			},
		},
	},
};

exports.facebookSaveMemberSchema = {
	schema: {
		body: {
			required: ['full_name', 'email', 'mobile_phone', 'pin'],
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
					type: 'integer',
					maxLength: 18,
					minLength: 11,
				},
				pin: {
					type: 'integer',
					maxLength: 6,
					minLength: 6,
				},
				image: {
					type: 'string',
					// isFileType:true,
					// type:"object"
				},
				fingerprint: {
					type: 'integer',
				},
			},
		},
	},
};

exports.facebookOtpSchema = {
	schema: {
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
		body: {
			required: ['full_name', 'email', 'fb_id', 'fb_token', 'mobile_phone', 'pin'],
			properties: {
				full_name: { type: 'string' },
				email: { type: 'string' },
				image: {
					type: 'string',
					// isFileType:true,
					// type:"object"
				},
				fb_id: { type: 'integer' },
				fb_token: { type: 'integer' },
				mobile_phone: { type: 'integer' },
				pin: { type: 'integer' },
				fingerprint: { type: 'integer' },
			},
		},
	},
};
