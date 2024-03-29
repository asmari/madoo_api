exports.checkConvertion = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		description: 'Rest API for validate conversion role',
		querystring: {
			type: 'object',
			required: ['loyalty_id_source', 'loyalty_id_target', 'point_to_convert'],
			properties: {
				loyalty_id_source: {
					type: 'integer',
				},
				loyalty_id_target: {
					type: 'integer',
				},
				point_to_convert: {
					type: 'integer',
				},
			},
		},
	},
};
exports.getConvertion = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		description: 'Rest API for check conversion point between loyalty',
		querystring: {
			type: 'object',
			required: ['conversion_type', 'loyalty_id'],
			properties: {
				loyalty_id: {
					type: 'integer',
				},
				conversion_type: {
					type: 'string',
					description: 'from/to',
				},
				search: {
					type: 'string',
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
exports.getDestination = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		description: 'Rest API for get all available conversion destination',
		querystring: {
			type: 'object',
			required: ['loyalty_id'],
			properties: {
				loyalty_id: {
					type: 'integer',
				},
				search: {
					type: 'string',
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

exports.getSource = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		description: 'Rest API for get all available conversion source',
		querystring: {
			type: 'object',
			properties: {
				search: {
					type: 'string',
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

exports.doConvertionSchema = {
	schema: {
		description: 'Rest API to convert point',
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		body: {
			required: ['loyalty_id_source', 'loyalty_id_target', 'point_to_convert'],
			properties: {
				loyalty_id_source: {
					type: 'integer',
				},
				loyalty_id_target: {
					type: 'integer',
				},
				point_to_convert: {
					type: 'integer',
				},
			},
		},
	},
};

exports.getConvertionKeyboard = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		description: 'Rest API for validate conversion role',
		querystring: {
			type: 'object',
			required: ['loyalty_id_source', 'loyalty_id_target'],
			properties: {
				loyalty_id_source: {
					type: 'integer',
				},
				loyalty_id_target: {
					type: 'integer',
				},
			},
		},
	},
};

exports.doTriggerStatus = {
	schema: {
		description: 'Rest API to trigger status',
		security: [
			{
				'skip-auth': [],
			},
		],
		body: {
			required: ['user_id', 'unix_id', 'status'],
			properties: {
				user_id: {
					type: 'integer',
				},
				unix_id: {
					type: 'string',
				},
				status: {
					type: 'string',
				},
			},
		},
	},
};
