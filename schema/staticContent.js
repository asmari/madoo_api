exports.aboutSchema = {
	schema: {
		security: [
			{
				'skip-auth': [],
			},
		],
		description: 'Rest API for about',
	},
};
exports.contactSchema = {
	schema: {
		security: [
			{
				'skip-auth': [],
			},
		],
		description: 'Rest API for contact',
	},
};
