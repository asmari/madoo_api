const { Response, ErrorResponse } = require('../../helper/response');
const model = require('../../models');

const Contact = model.Contact.Get;

// get list contact
exports.getContact = async () => {
	const contacts = await Contact.findAll();

	if (contacts.length > 0) {
		return new Response(20033, contacts[0]);
	}

	return new ErrorResponse(41707);
};
