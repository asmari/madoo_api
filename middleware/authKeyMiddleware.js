const fp = require('fastify-plugin');

const model = require('../models/index');
const { ErrorResponse } = require('../helper/response');
const { AuthApi } = require('../helper/Logger');

const AuthApiKeys = model.AuthApiKeys.Get;

const isContain = (url, keys) => {
	let isTrue = false;

	keys.forEach((value) => {
		const t = url.match(value);

		if (t) {
			isTrue = true;
		}
	});

	return isTrue;
};

module.exports = fp(async (fastify, opts, next) => {
	fastify.addHook('onRequest', async (request) => {
		const { headers } = request;

		if (request.originalUrl === '/') {
			return this;
		}

		if (isContain(request.originalUrl, [
			'/docs',
			'/v1/members/email/verification',
			'/v1/loyalty/refresh/auth',
		])) {
			return this;
		}

		AuthApi.info(headers);

		if (Object.prototype.hasOwnProperty.call(headers, 'skip-auth')) {
			return this;
		}

		if (Object.prototype.hasOwnProperty.call(headers, 'clientid') && Object.prototype.hasOwnProperty.call(headers, 'clientsecret')) {
			const authApi = await AuthApiKeys.findOne({
				where: {
					client_id: headers.clientid,
					client_secret: headers.clientsecret,
				},
			});

			if (authApi) {
				AuthApi.info('Success Access Api Key', authApi.type_auth);
				return this;
			}

			AuthApi.warn('Failed Api Key', headers.clientid, ':', headers.clientsecret);
			throw new ErrorResponse(40115);
		} else {
			throw new ErrorResponse(40116);
		}
	});

	next();
});
