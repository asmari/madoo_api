exports.promoListSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
			},
		],
		description: 'Rest API for List Promo',
		querystring: {
			type: 'object',
			properties: {
				page: {
					type: 'integer',
				},
				item: {
					type: 'integer',
				},
				search: {
					type: 'string',
				},
				sort: {
					type: 'string',
				},
				filter: {
					type: ['array', 'integer'],
					items: {
						type: 'integer',
					},
				},
			},
		},
	},
};

exports.promoDetailSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
			},
		],
		description: 'Rest API for detail promo',
		querystring: {
			type: 'object',
			properties: {
				promo_id: {
					type: 'integer',
				},
			},
			required: ['promo_id'],
		},
	},
};
exports.promoRandomSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
			},
		],
		querystring: {
		},
	},
};
