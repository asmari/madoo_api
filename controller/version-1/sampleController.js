// Get welcome message
exports.getSampleMessage = async (request, reply) => {
	try {
		return reply.code(200).send({ hello: 'guest' });
	} catch (err) {
		throw err;
	}
};

exports.getSampleScreet = async (request, reply) => {
	try {
		request.jwtVerify(err => reply.code(200).send(err || { hello: 'fuad' }));
	} catch (err) {
		throw err;
	}
};
