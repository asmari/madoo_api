const fp = require('fastify-plugin');
const { ErrorResponse } = require('./helper/response');

module.exports = fp((fastify, _, next) => {
	fastify.setErrorHandler((error, __, reply) => {
		if (error && error instanceof ErrorResponse) {
			reply
				.code(error.statusCode)
				.send({
					code: error.code,
					message: error.message,
				});
		} else if (error.validation && error.validation.length > 0) {
			let errBag = new Error('');

			switch (error.validation[0].keyword) {
			case 'required':
				errBag = new ErrorResponse(42200, {
					field: error.validation[0].params.missingProperty,
				});
				break;

			case 'minLength':
				errBag = new ErrorResponse(42206, {
					field: error.validation[0].dataPath.replace('.', ''),
					length: error.validation[0].params.limit,
				});
				break;

			default:
				errBag = new ErrorResponse(42298, {
					message: error.toString(),
				});
				break;
			}

			reply
				.code(errBag.statusCode)
				.send({
					code: errBag.code,
					message: errBag.message,
				});
		} else {
			reply
				.send(error);
		}
	});

	next();
});
