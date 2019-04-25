const model = require('../../models');
const { Response, ErrorResponse } = require('../../helper/response');

const Wording = model.Wording.Get;

exports.getWordingList = async (request) => {
	const { query, headers } = request;

	const paramsWhere = {
		lang: 'en',
	};

	if (Object.prototype.hasOwnProperty.call(query, 'lang')) {
		paramsWhere.lang = query.lang;
	}

	if (Object.prototype.hasOwnProperty.call(query, 'version')) {
		paramsWhere.version = query.version;
	}

	if (Object.prototype.hasOwnProperty.call(headers, 'lang')) {
		paramsWhere.lang = headers.lang;
	}

	const wording = await Wording.findAll({
		where: {
			...paramsWhere,
		},
	});

	if (wording) {
		return new Response(20039, wording);
	}

	return new ErrorResponse(41708, {
		lang: paramsWhere.lang,
	});
};
