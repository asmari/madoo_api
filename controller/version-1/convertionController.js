const helper = require('../../helper');
const model = require('../../models');

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
