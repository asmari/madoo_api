const model = require('../../models');
const { ErrorResponse, Response } = require('../../helper/response');

const ConvertionRate = model.ConvertionRate.Get;
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

		const source = await Loyalty.findOne({
			where: {
				id: params.loyalty_id_source,
			},
		});

		if (point % source.multiple !== 0) {
			// Error: :message
			throw new ErrorResponse(42298, {
				message: `Point not multiply by ${source.multiple}`,
			});
		}

		if (point < source.min_convertion) {
			// Error: :message
			throw new ErrorResponse(42298, {
				message: `Point is less than ${source.min_convertion}`,
			});
		}

		const newPoint = point * rate.point_conversion;

		return new Response(20003, {
			...params,
			point_converted: newPoint,
		});
	}
	// Error: Convertion rate not found
	throw new ErrorResponse(40402);
};


exports.doConvertionPoint = async () => {

};
