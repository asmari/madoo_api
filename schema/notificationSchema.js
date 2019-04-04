exports.fcmTokenSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
			},
		],
		description: 'Rest API for ??',
		querystring: {
			type: 'object',
			properties: {
				members_id: {
					type: 'integer',
				},
				device_id: {
					type: 'integer',
				},
				fcm_token: {
					type: 'string',
				},
				device_type: {
					type: 'string',
				},
				device_info: {
					type: 'string',
				},
			},
			required: ['members_id', 'fcm_token', 'device_id'],
		},

	},

};
