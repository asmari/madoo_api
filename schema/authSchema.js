exports.authLoginSchema = {
	schema: {
		security: [
			{
				'skip-auth': [],
			},
		],
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
		security: [
			{
				'skip-auth': [],
			},
		],
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
		security: [
			{
				'skip-auth': [],
			},
		],
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
		security: [
			{
				'skip-auth': [],
			},
		],
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
					type: 'string',
					min: 6,
					max: 6,
				},
				confirm_pin: {
					type: 'string',
					min: 6,
					max: 6,
				},
			},
		},
	},
};

exports.authCheckSchema = {
	schema: {
		security: [
			{
				'skip-auth': [],
			},
		],
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
				'skip-auth': [],
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

exports.authLinkSocialSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		description: 'Rest API for linking social media',
		body: {
			properties: {
				type: {
					type: 'integer',
					enums: [1, 2],
					description: '"1" for facebook / "2" for google',
				},
				id: {
					type: 'string',
				},
				token: {
					type: 'string',
				},
				name: {
					type: 'string',
				},
			},
			required: ['type', 'id', 'token'],
		},
	},
};
