'use strict'
//import fastify-formbody and fastify-multipart for parsing body request post
const fastifyFormBody = require("fastify-formbody")
const fastifyMultipart = require("fastify-multipart")

// Require the framework and instantiate it
const fastify = require('fastify')({
	// http2: true,
	logger: true
})
const jwt = require('fastify-jwt')

fastify.register(jwt, {
	secret: function (request, reply, callback) {
		callback(null, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')
	}
})

//register formbody and multipart parsing body post
fastify.register(fastifyFormBody)
fastify.register(fastifyMultipart)

// Declare a route
fastify.get('/', function (request, reply) {
	reply.send({ hello: 'fuad' })
})

// Register your version plugin
fastify.register(require('./routes/version-1'), { prefix: '/v1' })

// Run the server!
fastify.listen(3000, function (err, address) {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	}
})