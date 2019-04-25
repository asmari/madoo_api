const sequelize = require('sequelize');
const helper = require('../../helper');
const model = require('../../models');
const RestClient = require('../../restclient');
const { ErrorResponse, Response, ResponsePaginate } = require('../../helper/response');

const { Op } = sequelize;

const Loyalty = model.Loyalty.Get;
const LoyaltyMemberCards = model.LoyaltyMemberCards.Get;
const LoyaltyType = model.LoyaltyType.Get;
const MemberCards = model.MembersCards.Get;
const Promo = model.Promo.Get;
const Members = model.Members.Get;

// Save Membercard loyalty
exports.doSaveMemberCard = async (request) => {
	const { user, body } = request;

	switch (body.type_id) {
	case 'card_number':
		if (!Object.prototype.hasOwnProperty.call(body, 'card_number')) {
			throw new ErrorResponse(42200, {
				field: 'card_number',
			});
		}
		break;

	case 'email':
		if (!Object.prototype.hasOwnProperty.call(body, 'email')) {
			throw new ErrorResponse(42200, {
				field: 'email',
			});
		}
		break;

	case 'mobile_number':
		if (!Object.prototype.hasOwnProperty.call(body, 'mobile_number')) {
			throw new ErrorResponse(42200, {
				field: 'mobile_number',
			});
		}
		break;

	default:

		break;
	}

	const signupDate = Date.parse(body.signup_date);

	// eslint-disable-next-line no-restricted-globals
	if (isNaN(signupDate)) {
		throw new ErrorResponse(42210, {
			field: 'signup_date',
		});
	}

	const member = await Members.findOne({
		where: {
			id: user.id,
		},
	});

	if (member) {
		try {
			const memberCard = await MemberCards.create({
				members_id: member.id,
				card_number: body.card_number || '',
				full_name: member.full_name,
				email: body.email || '',
				mobile_number: body.mobile_number || '',
				date_birth: body.date_birth || null,
				member_level: body.member_level || '',
				signup_date: body.signup_date,
				expiry_date: body.expiry_date || null,
				type_id: body.type_id,
				point_balance: body.point_balance,
			});

			await LoyaltyMemberCards.create({
				loyalty_id: body.loyalty_id,
				member_cards_id: memberCard.id,
			});

			return new Response(20028, memberCard);
		} catch (err) {
			throw new ErrorResponse(42298, {
				message: err.toString(),
			});
		}
	}

	throw new ErrorResponse(41700);
};


// Check membercard loyalty
exports.doCheckMemberCard = async (request) => {
	const params = JSON.parse(JSON.stringify(request.query)) || {};

	const loyalty = await Loyalty.findOne({
		where: {
			id: params.loyalty_id,
		},
	});

	let json = null;

	if (loyalty.api_user_detail !== null) {
		try {
			json = JSON.parse(loyalty.api_user_detail);
		} catch (err) {
			throw new ErrorResponse(42208, {
				error: err.toString(),
			});
		}

		const rest = new RestClient(json);

		rest.insertBody(params);

		const response = await rest.request();

		if (response instanceof Error) {
			throw new ErrorResponse(42298, {
				message: response.toString(),
			});
		}
		return new Response(20027, response);
	}
	return new ErrorResponse(42209);
};

// Delete Membercard loyalty
exports.doDeleteLoyaltyMemberCard = async (request, reply) => {
	const { user } = request;
	const params = request.body || {};

	if (!Object.prototype.hasOwnProperty.call(params, 'member_cards_id')) {
		// Error: Required field :field
		throw new ErrorResponse(42200, {
			field: 'member_cards_id',
		});
	}

	const memberCard = await MemberCards.findOne({
		where: {
			members_id: user.id,
			id: params.member_cards_id,
		},
		include: [LoyaltyMemberCards],
	});

	if (memberCard != null) {
		memberCard.destroy();
		reply.send(helper.Success({
			delete: true,
		}));
	}
	return new Response(20010, {
		delete: false,
	});
};

// Get Detail Member Card with loyalty
exports.getDetailMember = async (request) => {
	const params = JSON.parse(JSON.stringify(request.query)) || {};
	const { user } = request;

	MemberCards.hasMany(LoyaltyMemberCards, {
		foreignKey: 'member_cards_id',
		sourceKey: 'id',
		onDelete: 'CASCADE',
	});

	if (request.validationError) {
		throw (request.validationError);
	}

	if (!Object.prototype.hasOwnProperty.call(params, 'loyalty_id')) {
		// Error: Required field :field
		throw new ErrorResponse(42200, {
			field: 'member_cards_id',
		});
	}

	const memberCards = await MemberCards.findOne({
		where: {
			members_id: user.id,
		},
		include: [{
			model: LoyaltyMemberCards,

			include: [{
				model: Loyalty,
				required: true,
				where: {
					id: params.loyalty_id,
				},
			}],
		}],
	});

	const memberCardsTemp = memberCards;
	if (memberCards != null) {
		if (memberCards.loyalty_has_member_cards) {
			const loyaltyCards = memberCards.loyalty_has_member_cards;
			if (loyaltyCards != null) {
				const { loyalty } = loyaltyCards;

				if (loyalty != null) {
					const promo = await Promo.findAll({
						raw: true,
						where: {
							loyalty_id: loyalty.id,
						},
					});

					if (promo != null) {
						loyalty.dataValues.promo = promo;
					} else {
						loyalty.dataValues.promo = [];
					}

					loyaltyCards.dataValues.loyalty = loyalty;
					memberCardsTemp.loyalty_has_member_cards[0] = loyaltyCards;
				}
			}

			return new Response(20012, memberCardsTemp);
		}
	}
	// Error: Member cards with loyalty not found!
	throw new ErrorResponse(41704);
};

// List Detail Member Card
exports.getLoyaltyMember = async (request) => {
	const { user } = request;

	const params = {
		page: parseInt(request.query.page, 10) || 1,
		item: parseInt(request.query.item, 10) || 5,
		search: request.query.search || null,
		sort: request.query.sort || null,
		filter: request.query.filter || [],
		total: 0,
	};

	let orderLoyalty = [
		'id', 'ASC',
	];

	let orderCards = [
		'id', 'ASC',
	];

	if (params.sort != null) {
		switch (params.sort) {
		case 1:
			orderLoyalty = [Loyalty, 'name', 'ASC'];
			break;

		case 2:
			orderCards = ['point', 'ASC'];
			break;

		case 3:
			orderCards = ['point', 'DESC'];
			break;

		default:

			break;
		}
	}

	const cards = await MemberCards.findAll({
		where: {
			members_id: user.id,
		},
		order: [
			orderCards,
		],
	});
	const cardsId = cards.map(value => value.id);

	const whereLoyalty = {};

	if (orderCards.length > 0 && orderCards[0] === 'point') {
		orderLoyalty = sequelize.literal(`FIELD(member_cards_id, ${cardsId.join(',')}) ASC`);
	}

	if (typeof (params.filter) !== 'string' && params.filter.length > 0) {
		const loyaltyId = params.filter.map(value => parseInt(value, 10));

		whereLoyalty.id = {
			[Op.in]: loyaltyId,
		};
	} else if (typeof params.filter !== 'undefined' && params.filter.length > 0) {
		if (!parseInt(params.filter, 10)) {
			whereLoyalty.id = {
				[Op.in]: [parseInt(params.filter, 10)],
			};
		}
	}

	if (params.search != null && typeof (params.search) === 'string') {
		whereLoyalty.name = {
			[Op.like]: `%${params.search}%`,
		};
	}

	const dataOptions = {
		page: params.page,
		paginate: params.item,
		where: {
			member_cards_id: {
				[Op.in]: cardsId,
			},
		},
		order: [
			orderLoyalty,
		],
		include: [{
			model: Loyalty,
			where: whereLoyalty,
		}, {
			model: MemberCards,
		}],
	};


	const loyaltyCards = await LoyaltyMemberCards.paginate(dataOptions);
	const data = loyaltyCards.docs;

	return new ResponsePaginate(20013, {
		item: params.item,
		pages: params.page,
		total: loyaltyCards.total,
	}, data);
};

// list loyalty
exports.getListLoyalty = async () => {
	const data = await LoyaltyType.findAll({
		order: [
			['id', 'ASC'],
		],
		include: [Loyalty],
	});

	return new Response(20014, data);
};

// get detail loyalty
exports.getDetailLoyalty = async (request) => {
	const query = JSON.parse(JSON.stringify(request.query));

	const loyalty = await Loyalty.findOne({
		where: {
			id: query.loyalty_id,
		},
		include: [Promo],
	});

	return new Response(20015, loyalty);
};
