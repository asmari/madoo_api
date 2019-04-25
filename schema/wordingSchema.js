exports.wordingListSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
			},
		],
		querystring: {
			properties: {
				lang: {
					type: 'string',
				},
				version: {
					type: 'string',
				},
			},
		},
		headers: {
			properties: {
				lang: {
					type: 'string',
				},
			},
		},
	},
};
