const { Response, CodeResponse } = require('../../helper/response');

// Get welcome message
exports.getSampleMessage = async () => new Response(20099, { hello: 'guest' });

exports.getSampleScreet = async (request) => {
	const res = await new Promise((resolve, reject) => {
		request.jwtVerify((err) => {
			if (err) {
				return reject(err);
			}

			return resolve({ hello: 'fuad' });
		});
	});

	return new Response(20099, res);
};

exports.getCodeResponse = async () => new Response(20099, CodeResponse);
