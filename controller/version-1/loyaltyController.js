const sequelize = require('sequelize');
const helper = require('../../helper');
const model = require('../../models');
const { ErrorResponse, Response, ResponsePaginate } = require('../../helper/response');

const { Op } = sequelize;

const Loyalty = model.Loyalty.Get;
const LoyaltyMemberCards = model.LoyaltyMemberCards.Get;
const LoyaltyType = model.LoyaltyType.Get;
const MemberCards = model.MembersCards.Get;
const Promo = model.Promo.Get;

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
	throw new ErrorResponse(40404);
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

	if (params.sort != null && typeof (params.sort) === 'string') {
		switch (params.sort) {
		case 'alphabet':
			orderLoyalty = [Loyalty, 'name', 'ASC'];
			break;

		case 'point_low':
			orderCards = ['point', 'ASC'];
			break;

		case 'point_high':
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
