exports.wordingListSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
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
