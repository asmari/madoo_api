exports.checkConvertion = {
	schema: {
		security: [
			{
				BearerAuth: [],
			},
		],
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
		querystring: {
			type: 'object',
			required: ['conversion_type','loyalty_id'],
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
