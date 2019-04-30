exports.checkConvertion = {
	schema: {
		security: [
			{
				BearerAuth: [],
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
