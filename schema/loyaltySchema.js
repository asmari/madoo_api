exports.loyaltyMemberListSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		description: 'Rest API for members loyalty program list',
		querystring: {
			type: 'object',
			properties: {
				force_refresh_point: {
					type: 'integer',
				},
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
					type: 'integer',
					enum: [1, 2, 3],
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

exports.loyaltyCheckRequiredField = {
	schema: {
		description: 'Rest Api Check Required field',
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		querystring: {
			type: 'object',
			properties: {
				loyalty_id: {
					type: 'integer',
				},
				type_id: {
					type: 'integer',
					enums: [1, 2, 3, 4],
				},
			},
			required: ['loyalty_id', 'type_id'],
		},
	},
};

exports.loyaltyCheckMemberSchema = {
	schema: {
		description: 'Api Check Member card loyalty',
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		querystring: {
			type: 'object',
			properties: {
				loyalty_id: {
					type: 'integer',
				},
			},
			required: ['loyalty_id'],
		},
	},
};

exports.loyaltySaveMemberCardSchema = {
	schema: {
		description: 'Rest API Save Member Card Loyalty',
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		body: {
			properties: {
				loyalty_id: {
					type: 'integer',
				},
				// type_id: {
				// 	type: 'integer',
				// 	enum: [1, 2, 3],
				// },
				card_number: {
					type: ['string', 'null'],
				},
				email: {
					type: ['string', 'null'],
				},
				mobile_number: {
					type: ['string', 'null'],
				},
				date_birth: {
					type: ['string', 'null'],
				},
				member_level: {
					type: ['string', 'null'],
				},
				expiry_date: {
					type: ['string', 'null'],
				},
				point_balance: {
					type: 'integer',
				},
				auth: {
					description: 'Put auth object here if api using auth',
					type: 'object',
				},
			},
			required: ['loyalty_id', 'point_balance'],
		},
	},
};

exports.loyaltyMemberDetailSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		description: 'Rest API for members loyalty program datail',
		querystring: {
			type: 'object',
			properties: {
				loyalty_id: {
					type: 'integer',
				},
			},
			required: ['loyalty_id'],
		},

	},
};

exports.loyaltyListSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		description: 'Rest API for Loyalty Program list',
		querystring: {
			type: 'object',
			properties: {
				search: {
					type: 'string',
				},
			},
		},
	},
};

exports.loyaltyDetailSchema = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		description: 'Rest API for Loyalty Program detail',
		querystring: {
			type: 'object',
			properties: {
				loyalty_id: {
					type: 'integer',
				},
			},
			required: ['loyalty_id'],
		},
	},
};

exports.loyaltyDeleteMembercard = {
	schema: {
		security: [
			{
				BearerAuth: [],
				'skip-auth': [],
			},
		],
		description: 'Rest API for members delete loyalty program',
		body: {
			properties: {
				member_cards_id: {
					type: 'string',
				},
			},
			required: ['member_cards_id'],
		},
	},
};
