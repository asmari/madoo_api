const sequelize = require('sequelize');
const helper = require('../../helper');
const model = require('../../models');

const { Op } = sequelize;
const ConvertionRate = model.ConvertionRate.Get;
const Loyalty = model.Loyalty.Get;

exports.checkConvertionRate = async (request, reply) => {
	try {
		const params = JSON.parse(JSON.stringify(request.query));

		const rate = await ConvertionRate.findOne({
			where: {
				loyalty_id: params.loyalty_id_source,
				conversion_loyalty: params.loyalty_id_target,
			},
		});

		if (rate) {
			const point = params.point_to_convert;

			const source = await Loyalty.findOne({
				where: {
					id: params.loyalty_id_source,
				},
			});

			if (point % source.multiple !== 0) {
				throw new Error(`Point not multiply by ${source.multiple}`);
			}

			if (point < source.min_convertion) {
				throw new Error(`Point is less than ${source.min_convertion}`);
			}

			const newPoint = point * rate.point_conversion;

			return reply.send(helper.Success({
				...params,
				point_converted: newPoint,
			}));
		}

		throw new Error('Conversion Rate not found');
	} catch (err) {
		return reply.send(helper.Fail(err));
	}
};


exports.doConvertionPoint = async () => {

};


exports.getConvertionRate = async (request, reply) => {
	try {
		const whereCondition = {};
		const whereSource = {};
		const whereTarget = {};
		const params = JSON.parse(JSON.stringify(request.query));

		params.page = parseInt(params.page, 10) || 1;
		params.item = parseInt(params.item, 10) || 10;
		if (params.loyalty_id != null) {
			if (params.conversion_type === 'from') {
				whereCondition.loyalty_id = params.loyalty_id;
				if (params.search != null && typeof (params.search) === 'string') {
					whereTarget.name = {
						[Op.like]: `%${params.search}%`,
					};
				}
			} else {
				whereCondition.conversion_loyalty = params.loyalty_id;
				if (params.search != null && typeof (params.search) === 'string') {
					whereSource.name = {
						[Op.like]: `%${params.search}%`,
					};
				}
			}
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
			console.log(conversion);
			reply.send(helper.Paginate({
				item: params.item,
				pages: params.page,
				total: conversion.total,
			}, conversion.docs));
		}

		throw new Error('Conversion Rate not found');
	} catch (err) {
		return reply.send(helper.Fail(err));
	}
};
