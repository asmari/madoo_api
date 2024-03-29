const fs = require('fs');
// Require the framework and instantiate it
const fastify = require('fastify')({
	// http2: true,
	logger: true,
});

// import fastify-formbody and fastify-multipart for parsing body request post
const fastifyFormBody = require('fastify-formbody');
// const fastifyMultipart = require("fastify-multipart")

// import fastify-file-upload for uploading image
const fastifyFileUpload = require('fastify-file-upload');

require('dotenv').config();

const authKeyMiddleware = require('./middleware/authKeyMiddleware');
const security = require('./security');
const errorHandler = require('./errorHandler');
const documentations = require('./documentations');
const config = require('./config').get;
const { logger } = require('./helper/Logger');

// register auth key api
fastify.register(authKeyMiddleware);

// register jwt security
fastify.register(security);

if (config.app_env === 'dev' || config.app_env === 'staging') {
	// register fastify swagger
	fastify.register(documentations);
}


// register fastify error boom
fastify.register(errorHandler);

// register upload file plugin
fastify.register(fastifyFileUpload);

// register formbody and multipart parsing body post
fastify.register(fastifyFormBody);

// Declare a route
fastify.get('/', { schema: { hide: true } }, (request, reply) => {
	reply.send({ hello: 'fuad' });
});

// Register your version plugin
fastify.register(require('./routes/version-1'), { prefix: '/v1' });
fastify.register(require('./routes/version-2'), { prefix: '/v2' });

// check if upload folder is exist, if not create it
if (!fs.existsSync('./upload')) {
	fs.mkdirSync('./upload');
}

// Run the server!
fastify.listen(config.serverPort, '0.0.0.0', (err) => {
	if (err) {
		logger.trace(err);
		// fastify.log.error(err);
		process.exit(1);
	}
});
