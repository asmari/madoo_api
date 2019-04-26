exports.authLoginSchema = {
	schema: {
		description: 'Rest API for members login',
		body: {
			// Required body paramter for login
			required: ['mobile_phone', 'pin'],
			properties: {
				mobile_phone: {
					type: 'string',
				},
				pin: {
					type: 'string',
				},
			},
		},
	},
};

exports.authForgotPinOtp = {
	schema: {
		description: 'Rest API for forgot pin',
		body: {
			required: ['mobile_phone'],
			properties: {
				mobile_phone: {
					type: 'string',
				},
			},
		},
	},
};

exports.authForgotPinOtpCheck = {
	schema: {
		description: 'Rest API for forgot pin verify OTP',
		body: {
			required: ['mobile_phone', 'otp'],
			properties: {
				mobile_phone: {
					type: 'string',
				},
				otp: {
					type: 'string',
				},
			},
		},
	},
};

exports.authChangePin = {
	schema: {
		description: 'Rest API for forgot pin save new',
		body: {
			required: ['mobile_phone', 'pin', 'confirm_pin'],
			properties: {
				mobile_phone: {
					type: 'string',
					minLength: 11,
					maxLength: 18,
				},
				pin: {
					type: 'integer',
					min: 6,
					max: 6,
				},
				confirm_pin: {
					type: 'integer',
					min: 6,
					max: 6,
				},
			},
		},
	},
};

exports.authCheckSchema = {
	schema: {
		description: 'Rest API for validate mobile phone',
		body: {
			required: ['mobile_phone'],
			properties: {
				mobile_phone: { type: 'string' },
			},
		},
	},
};

exports.authUnlinkSocialSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
			},
		],
		description: 'Rest API for unlink social media from member',
		body: {
			required: ['type'],
			properties: {
				type: {
					type: 'integer',
					enums: [1, 2],
				},
			},
		},
	},
};
