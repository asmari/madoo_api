exports.loyaltyListSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
			},
		],
		description: 'Rest API for loyalty program list v2',
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
				with_user: {
					type: 'integer',
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

exports.loyaltyListTypeSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
			},
		],
		description: 'Rest API for loyalty type list v2',
	},
};
