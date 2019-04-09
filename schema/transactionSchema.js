exports.transactionListSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
			},
		],
		description: 'Transaction History for member card',
		querystring: {
			type: 'object',
			properties: {
				item: {
					type: 'integer',
				},
				page: {
					type: 'integer',
				},
				filter_transaction: {
					type: ['array', 'integer'],
					items: {
						type: 'integer',
					},
				},
				filter_loyalty: {
					type: ['array', 'integer'],
					items: {
						type: 'integer',
					},
				},
			},
		},
	},
};
