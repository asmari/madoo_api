const { Op } = require('sequelize');
const model = require('../../models');
const { ResponsePaginate, Response } = require('../../helper/response');

const Loyalty = model.Loyalty.Get;
const LoyaltyType = model.LoyaltyType.Get;

// get list loyalty v2
exports.doGetListLoyalty = async (request) => {
	const query = JSON.parse(JSON.stringify(request.query));

	const params = {
		page: parseInt(query.page, 10) || 1,
		item: parseInt(query.item, 10) || 10,
		search: query.search || null,
		filter: query.filter || 0,
	};

	const whereSearch = {};

	if (params.search !== null) {
		whereSearch.name = {
			[Op.like]: `%${params.search}%`,
		};
	}

	if (params.filter !== 0) {
		whereSearch.type_loyalty_id = params.filter;
	}

	const loyaltyList = await Loyalty.paginate({
		page: params.page,
		paginate: params.item,
		where: {
			...whereSearch,
		},
		attributes: {
			exclude: ['api_user_detail', 'api_user_point', 'api_point_plus', 'api_point_minus'],
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
