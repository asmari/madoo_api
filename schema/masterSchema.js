exports.listCard = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
	},
};
