const { Op } = require('sequelize');
const model = require('../../models');
const { ResponsePaginate, Response } = require('../../helper/response');

const Loyalty = model.Loyalty.Get;
const MemberCards = model.MembersCards.Get;
const LoyaltyType = model.LoyaltyType.Get;
const LoyaltyHasMemberCards = model.LoyaltyMemberCards.Get;

// get list loyalty v2
exports.doGetListLoyalty = async (request) => {
	const { user } = request;
	const query = JSON.parse(JSON.stringify(request.query));

	const params = {
		page: parseInt(query.page, 10) || 1,
		item: parseInt(query.item, 10) || 10,
		search: query.search || null,
		filter: query.filter || 0,
		with_user: Object.prototype.hasOwnProperty.call(query, 'with_user') ? query.with_user : 0,
	};

	const whereSearch = {};

	if (params.with_user !== 0) {
		const cards = await MemberCards.findAll({
			where: {
				members_id: user.id,
			},
			attributes: ['id'],
		});

		const cardsId = cards.map(value => value.id);

		const loyaltyHasCards = await LoyaltyHasMemberCards.findAll({
			where: {
				member_cards_id: {
					[Op.in]: cardsId,
				},
			},
			attributes: ['loyalty_id'],
		});

		const loyaltyId = loyaltyHasCards.map(value => value.loyalty_id);

		whereSearch.id = {
			[Op.notIn]: loyaltyId,
		};
	}

	if (params.search !== null) {
		whereSearch.name = {
			[Op.like]: `%${params.search}%`,
		};
	}

	if (params.filter !== 0) {
		let loyaltyFilter = params.filter;
		if (!Array.isArray(params.filter)) {
			loyaltyFilter = [params.filter];
		}

		whereSearch.type_loyalty_id = {
			[Op.or]: loyaltyFilter,
		};
	}

	const loyaltyList = await Loyalty.paginate({
		page: params.page,
		paginate: params.item,
		where: {
			...whereSearch,
		},
		order: [
			['name', 'ASC'],
		],
		attributes: {
			exclude: [
				'api_user_detail',
				'api_user_point',
				'api_point_plus',
				'api_point_minus',
				'api_refresh_token',
				'auth_field',
				'confirm_field',
			],
		},
	});

	return new ResponsePaginate(20014, {
		...loyaltyList,
		item: params.item,
	});
};


// get list type loyalty
exports.doGetListTypeLoyalty = async () => {
	const loyaltyType = await LoyaltyType.findAll();

	return new Response(20029, loyaltyType);
};
