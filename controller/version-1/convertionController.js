const sequelize = require('sequelize');
const model = require('../../models');
const { ErrorResponse, Response, ResponsePaginate } = require('../../helper/response');

const { Op } = sequelize;
const ConvertionRate = model.ConvertionRate.Get;
const Conversion = model.Conversion.Get;
const Loyalty = model.Loyalty.Get;

exports.checkConvertionRate = async (request) => {
	const params = JSON.parse(JSON.stringify(request.query));

	const rate = await ConvertionRate.findOne({
		where: {
			loyalty_id: params.loyalty_id_source,
			conversion_loyalty: params.loyalty_id_target,
		},
	});

	if (rate) {
		const point = params.point_to_convert;

		// const source = await Loyalty.findOne({
		// 	where: {
		// 		id: params.loyalty_id_source,
		// 	},
		// });

		if (point % rate.multiple !== 0) {
			// Error: :message
			throw new ErrorResponse(42298, {
				message: `Point not multiply by ${rate.multiple}`,
			});
		}

		if (point < rate.minimum) {
			// Error: :message
			throw new ErrorResponse(42298, {
				message: `Point is less than ${rate.minimum}`,
			});
		}

		const fromRate = rate.mid_from_rate / rate.point_loyalty;
		const toRate = rate.mid_to_rate / rate.point_conversion;

		let newPoint = point * fromRate;
		newPoint -= rate.fee;
		newPoint *= toRate;

		return new Response(20003, {
			...params,
			point_converted: newPoint,
		});
	}
	// Error: Convertion rate not found
	throw new ErrorResponse(41702);
};


exports.doConvertionPoint = async () => {

};


exports.getConvertionRate = async (request) => {
	const whereCondition = {};
	const whereSource = {};
	const whereTarget = {};
	const prohibitedTo = [];
	const prohibitedFrom = [];

	const params = JSON.parse(JSON.stringify(request.query));

	params.page = parseInt(params.page, 10) || 1;
	params.item = parseInt(params.item, 10) || 10;


	if (params.loyalty_id != null) {
		const conversionRule = await Conversion.findOne({ where: { loyalty_id: params.loyalty_id } });
		const conversionData = JSON.parse(conversionRule.data_conversion);

		if (conversionData.loyalty_from != null) {
			conversionData.loyalty_from.forEach((id) => {
				prohibitedFrom.push(id);
			});
		}
		if (conversionData.loyalty_to != null) {
			conversionData.loyalty_to.forEach((id) => {
				prohibitedTo.push(id);
			});
		}
		if (params.conversion_type === 'from') {
			if (conversionData.category_to != null) {
				const whereCategoryTo = { type_loyalty_id: { [Op.in]: conversionData.category_to } };
				const loyaltyTo = await Loyalty.findAll({ attributes: ['id'], where: whereCategoryTo, raw: true });
				loyaltyTo.forEach((id) => {
					prohibitedTo.push(id.id);
				});
			}
			whereCondition.loyalty_id = params.loyalty_id;
			if (params.search != null && typeof (params.search) === 'string') {
				whereTarget.name = {
					[Op.like]: `%${params.search}%`,
				};
			}
		} else {
			if (conversionData.category_from != null) {
				const whereCategoryFrom = { type_loyalty_id: { [Op.in]: conversionData.category_from } };
				const loyaltyFrom = await Loyalty.findAll({ attributes: ['id'], where: whereCategoryFrom });
				loyaltyFrom.forEach((id) => {
					prohibitedFrom.push(id.id);
				});
			}

			whereCondition.conversion_loyalty = params.loyalty_id;
			if (params.search != null && typeof (params.search) === 'string') {
				whereSource.name = {
					[Op.like]: `%${params.search}%`,
				};
			}
		}
	}

	if (prohibitedFrom.length !== 0) {
		whereCondition[Op.and] = {
			loyalty_id: {
				[Op.notIn]: prohibitedFrom,
			},
		};
	}
	if (prohibitedTo.length !== 0) {
		whereCondition[Op.and] = {
			conversion_loyalty: {
				[Op.notIn]: prohibitedTo,
			},
		};
	}

	const dataOptions = {
		include: [{
			model: Loyalty,
			as: 'Source',
			required: true,
			where: whereSource,
		}, {
			model: Loyalty,
			as: 'Target',
			required: true,
			where: whereTarget,
		}],
		page: params.page,
		paginate: params.item,
		where: whereCondition,
	};

	const conversion = await ConvertionRate.paginate({ ...dataOptions });
	if (conversion) {
		return new ResponsePaginate(20041, {
			item: params.item,
			pages: params.page,
			total: conversion.total,
		}, conversion);
	}

	throw new ErrorResponse(41701);
};
