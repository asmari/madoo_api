exports.fcmTokenSchema = {
	schema: {
		security: [
			{
				'skip-auth': [],
			},
		],
		description: 'Rest API for save device token member',
		body: {
			properties: {
				device_id: {
					type: 'string',
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
		security: [
			{
				'skip-auth': [],
			},
		],
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

exports.notificationDetailSchema = {
	schema: {
		description: 'Rest api get detail notification',
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		querystring: {
			type: 'object',
			properties: {
				notification_id: {
					type: 'integer',
				},
			},
			required: ['notification_id'],
		},
	},
};

exports.notificationListSchema = {
	schema: {
		description: 'Rest api list notification members',
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		querystring: {
			type: 'object',
			properties: {
				filter: {
					type: ['array', 'integer'],
					enums: [1, 2, 3],
					items: {
						type: 'integer',
						enums: [1, 2, 3],
					},
				},
				page: {
					type: 'integer',
				},
				item: {
					type: 'integer',
				},
			},
		},
	},
};

exports.notificationSettingsSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		description: 'Rest API for get notification settings',
	},
};

exports.notificationUpdateSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		description: 'Rest Api update notification status',
		body: {
			required: ['notification_id', 'read'],
			properties: {
				notification_id: {
					type: 'integer',
				},
				read: {
					type: 'integer',
				},
			},
		},
	},
};

exports.notificationCountSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		description: 'Rest api notification count',
	},
};

exports.notifSettingSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		description: 'Rest API for Create or Update Notification Setting',
		body: {
			type: 'object',
			required: ['promotion', 'conversion', 'other'],
			properties: {
				promotion: {
					type: 'integer',
				},
				conversion: {
					type: 'integer',
				},
				other: {
					type: 'integer',
				},
			},
			// required: ['promotion', 'conversion', 'other'],
		},

	},

};
