const moment = require('moment');
const sequelize = require('sequelize');

const helper = require('../../helper');
const model = require('../../models');

const { Op } = sequelize;
const Loyalty = model.Loyalty.Get;
const Promo = model.Promo.Get;

// get random promo
exports.getRandomPromo = async (request, reply) => {
	try {
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

		Promo.findAll({
			where: {
				...filterPromo,
				valid_until: {
					[Op.gte]: currentDate,
				},
			},
			include: [Loyalty],
			limit: 10,
			order: sequelize.literal('rand()'),
		}).then(promos => reply.code(200).send(helper.Success(promos)));
	} catch (err) {
		reply.send(helper.Fail(err));
	}
};
// get list promo
exports.getPromo = async (request, reply) => {
	try {
		const currentDate = moment().format('YYYY-MM-DD');
		const whereCondition = {};

		const params = {
			page: parseInt(request.query.page, 10) || 1,
			item: parseInt(request.query.item, 10) || 10,
			search: request.query.search || null,
			sort: request.query.sort || null,
			filter: request.query.filter || [],
			total: 0,
		};

		const paramsFilter = JSON.parse(JSON.stringify(request.query));


		if (Object.prototype.hasOwnProperty.call(paramsFilter, 'filter')) {
			const { filter } = paramsFilter;
			let filterParams = filter;

			if (typeof (filter) === 'number') {
				filterParams = [filter];
			}

			whereCondition.loyalty_id = {
				[Op.in]: filterParams,
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

		reply.send(helper.Paginate({
			item: params.item,
			pages: params.page,
			total: promos.total,
		}, data));
	} catch (err) {
		reply.send(helper.Fail(err));
	}
};
// get detail promo
exports.getDetailPromo = async (request, reply) => {
	try {
		const query = JSON.parse(JSON.stringify(request.query));

		const promo = await Promo.findOne({
			where: {
				id: query.promo_id,
			},
			include: [Loyalty],
		});


		reply.send(helper.Success(promo));
	} catch (err) {
		reply.send(helper.Fail(err));
	}
};
