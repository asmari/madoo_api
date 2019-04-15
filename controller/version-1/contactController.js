const { ResponsePaginate } = require('../../helper/response');
const model = require('../../models');

const Contact = model.Contact.Get;

// get list contact
exports.getContact = async (request) => {
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

	const contacts = await Contact.paginate(dataOptions);

	const data = contacts.docs;

	return new ResponsePaginate(20033, {
		item: params.item,
		pages: params.page,
		total: contacts.total,
	}, data);
};
