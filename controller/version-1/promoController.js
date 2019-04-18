const moment = require('moment');
const sequelize = require('sequelize');

const { Response, ResponsePaginate } = require('../../helper/response');
const model = require('../../models');

const { Op } = sequelize;
const Loyalty = model.Loyalty.Get;
const Promo = model.Promo.Get;

// get featured random
exports.getFeaturedPromo = async (request) => {
	const params = JSON.parse(JSON.stringify(request.query));

	let filterPromo = {};

	if (Object.prototype.hasOwnProperty.call(params, 'filter')) {
		let { filter } = params;

		if (typeof (filter) === 'number') {
			filter = [filter];
		}

		filterPromo = {
			id: {
				[Op.in]: filter,
			},
		};
	}

	const currentDate = moment().format('YYYY-MM-DD');

	const promos = await Promo.findAll({
		where: {
			...filterPromo,
			valid_until: {
				[Op.gte]: currentDate,
			},
			isfeatured: 1,
		},
		include: [Loyalty],
		limit: 3,
		// order: sequelize.literal('rand()'),
		order: [['updated_at', 'DESC']],
	});

	return new Response(20022, promos);
};

// get list promo
exports.getPromo = async (request) => {
	const currentDate = moment().format('YYYY-MM-DD');
	const whereCondition = {};

	const params = {
		page: parseInt(request.query.page, 10) || 1,
		item: parseInt(request.query.item, 10) || 10,
		search: request.query.search || null,
		sort: request.query.sort || null,
		filter_loyalty: request.query.filter_loyalty || [],
		filter_category: request.query.filter_category || [],
		total: 0,
	};

	if (!Array.isArray(params.filter_loyalty)) {
		params.filter_loyalty = [params.filter_loyalty];
	}
	if (!Array.isArray(params.filter_category)) {
		params.filter_category = [params.filter_category];
	}

	if (params.filter_loyalty.length > 0) {
		whereCondition.loyalty_id = {
			[Op.in]: params.filter_loyalty,
		};
	}
	if (params.filter_category.length > 0) {
		console.log(JSON.stringify(params.filter_category));
		const likeCondition = [];
		params.filter_category.forEach((element) => {
			likeCondition.push({ [Op.like]: `%"${element}"%` });
		});
		whereCondition.typeloyalty_id = {
			[Op.or]:
				likeCondition,
		};
	}

	const orderLoyalty = [
		'id', 'ASC',
	];

	whereCondition.valid_until = { [Op.gte]: currentDate };

	if (params.search != null && typeof (params.search) === 'string') {
		whereCondition.title = {
			[Op.like]: `%${params.search}%`,
			// "$loyalty.name$":{
			//     [Op.like]: "%" + params.search + "%"
			// },
		};
	}

	const dataOptions = {

		include: [{
			model: Loyalty,
			as: 'loyalty',
			required: true,
		}],
		page: params.page,
		paginate: params.item,
		where: whereCondition,
		order: [
			orderLoyalty,
		],
	};

	const promos = await Promo.paginate(dataOptions);

	const data = promos.docs;

	return new ResponsePaginate(20023, {
		item: params.item,
		pages: params.page,
		total: promos.total,
	}, data);
};

// get detail promo
exports.getDetailPromo = async (request) => {
	const query = JSON.parse(JSON.stringify(request.query));

	const promo = await Promo.findOne({
		where: {
			id: query.promo_id,
		},
		include: [Loyalty],
	});

	return new Response(20024, promo);
};
