'use strict'

const fs = require('fs')

//import fastify-formbody and fastify-multipart for parsing body request post
const fastifyFormBody = require("fastify-formbody")
// const fastifyMultipart = require("fastify-multipart")

//import fastify-file-upload for uploading image
const fastifyFileUpload = require("fastify-file-upload")

const security = require("./security") 

const config = require("./config").get

// Require the framework and instantiate it
const fastify = require('fastify')({
	// http2: true,
	logger: true
})
const jwt = require('fastify-jwt')

//register jwt security 
fastify.register(security)

//register upload file plugin
fastify.register(fastifyFileUpload)

//register formbody and multipart parsing body post
fastify.register(fastifyFormBody)
// fastify.register(fastifyMultipart)

// Declare a route
fastify.get('/', function (request, reply) {
	reply.send({ hello: 'fuad' })
})

// Register your version plugin
fastify.register(require('./routes/version-1'), { prefix: '/v1' })

//check if upload folder is exist, if not create it
if(!fs.existsSync("./upload")){
	fs.mkdirSync("./upload")
}

// Run the server!
fastify.listen(config.serverPort , function (err, address) {
	if (err) {
		console.log(err)
		// fastify.log.error(err)
		process.exit(1)
	}
})