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
				filter_loyalty: {
					type: ['array', 'integer'],
					items: {
						type: 'integer',
					},
				},
				filter_category: {
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
exports.promoFeaturedSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
			},
		],
		description: 'Rest API for featured promo',
		querystring: {
		},
	},
};


exports.promoAutoCompleteSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
			},
		],
		description: 'Rest API for autocomplete promos',
		querystring: {
			type: 'object',
			properties: {
				query: {
					type: 'string',
					minLength: 3,
				},
			},
			required: ['query'],
		},
		response: {
			200: {
				type: 'object',
				properties: {
					message: {
						type: 'string',
						example: 'Autocomplete Promos Success',
					},
					code: {
						type: 'integer',
						example: 20048,
					},
					data: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								id: {
									type: 'integer',
									example: 1,
								},
								title: {
									type: 'string',
									example: 'Lorem Ipsum',
								},
							},
						},
					},
				},
			},
			417: {
				type: 'object',
				properties: {
					code: {
						type: 'integer',
						example: 41711,
					},
					message: {
						type: 'string',
						example: 'Autocomplete promos not found',
					},
				},
			},
		},
	},
};
