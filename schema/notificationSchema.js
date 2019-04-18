exports.fcmTokenSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
			},
		],
		description: 'Rest API for save device token member',
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
			required: ['fcm_token', 'device_id'],
		},

	},

};

exports.fcmTriggerSchema = {
	schema: {
		description: 'Rest api to send trigger notification',
		querystring: {
			type: 'object',
			properties: {
				notification_id: {
					type: 'integer',
				},
				members_id: {
					type: 'integer',
				},
			},
			required: ['notification_id'],
		},
	},
};
