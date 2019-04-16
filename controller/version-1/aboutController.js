const { Response } = require('../../helper/response');
const model = require('../../models');

const About = model.About.Get;

// get list contact
exports.getAbout = async () => {
	const abouts = await About.findOne({
		limit: 1,
		order: [['updated_at', 'DESC']],
	});

	return new Response(20034, abouts);
};
