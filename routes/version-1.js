const sample = require('./version-1/sample');
const auth = require('./version-1/auth');
const members = require('./version-1/members');
const loyalty = require('./version-1/loyalty');
const promo = require('./version-1/promo');
const facebook = require('./version-1/facebook');
const google = require('./version-1/google');
const convertion = require('./version-1/convertion');
const masterRoute = require('./version-1/masterRoute');
const notification = require('./version-1/notification');
const transaction = require('./version-1/transaction');
const contact = require('./version-1/contact');
const about = require('./version-1/about');


async function routes(fastify) {
	fastify.get('/', { schema: { hide: true } }, async (request, reply) => reply.code(200).send({ hello: 'fuad' }));

	fastify.register(sample, { prefix: '/sample' });

	fastify.register(auth, { prefix: '/auth' });

	fastify.register(members, { prefix: '/members' });

	fastify.register(loyalty, { prefix: '/loyalty' });

	fastify.register(promo, { prefix: '/promo' });

	fastify.register(facebook, { prefix: '/facebook' });

	fastify.register(google, { prefix: '/google' });

	fastify.register(convertion, { prefix: '/conversion' });

	fastify.register(masterRoute, { prefix: '/master' });

	fastify.register(notification, { prefix: '/notification' });

	fastify.register(transaction, { prefix: '/transaction' });

<<<<<<< HEAD
	fastify.register(contact, { prefix: '/contact' });
=======
	fastify.register(about, { prefix: '/about' });
>>>>>>> remotes/origin/feature_rest_api_get_about
}

module.exports = routes;
