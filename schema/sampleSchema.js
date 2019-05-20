exports.sampleSchema = {
	schema: {
		hide: true,
		security: [
			{
				'skip-auth': [],
			},
		],
		querystring: {
			name: { type: 'integer' },
		},
	},
};
