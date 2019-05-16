const fp = require('fastify-plugin');

const model = require('../models/index');
const { ErrorResponse } = require('../helper/response');
const { AuthApi } = require('../helper/Logger');

const AuthApiKeys = model.AuthApiKeys.Get;

module.exports = fp(async (fastify, opts, next) => {
	fastify.addHook('onRequest', async (request) => {
		const { headers } = request;

		if (Object.prototype.hasOwnProperty.call(headers, 'skip-auth')) {
			return this;
		}

		if (Object.prototype.hasOwnProperty.call(headers, 'client_id') && Object.prototype.hasOwnProperty.call(headers, 'client_secret')) {
			const authApi = await AuthApiKeys.findOne({
				where: {
					client_id: headers.client_id,
					client_secret: headers.client_secret,
				},
			});

			if (authApi) {
				AuthApi.info('Success Access Api Key', authApi.type_auth);
				return this;
			}

			AuthApi.warn('Failed Api Key', headers.client_id, ':', headers.client_secret);
			throw new ErrorResponse(40115);
		} else {
			throw new ErrorResponse(40116);
		}
	});

	next();
});
