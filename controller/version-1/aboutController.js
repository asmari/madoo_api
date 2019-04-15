const { ResponsePaginate } = require('../../helper/response');
const model = require('../../models');

const About = model.About.Get;

// get list contact
exports.getAbout = async (request) => {
	const params = {
		page: parseInt(request.query.page, 10) || 1,
		item: parseInt(request.query.item, 10) || 10,
		search: request.query.search || null,
		sort: request.query.sort || null,
		filter: request.query.filter || [],
		total: 0,
	};

	const dataOptions = {
		page: params.page,
		paginate: params.item,
	};

	const abouts = await About.paginate(dataOptions);

	const data = abouts.docs;

	return new ResponsePaginate(20034, {
		item: params.item,
		pages: params.page,
		total: abouts.total,
	}, data);
};
