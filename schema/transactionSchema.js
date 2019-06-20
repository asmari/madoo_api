exports.transactionListSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
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

exports.transactionDetailSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		description: 'Rest api transaction detail',
		querystring: {
			type: 'object',
			required: ['transaction_id'],
			properties: {
				transaction_id: {
					type: 'integer',
				},
			},
		},
	},
};
