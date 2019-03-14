const memberController = require('../../controller/version-1/memberController');


async function routes(fastify, options) {
    // get members
    fastify.get('/', memberController.memberIndex)

    // register members
    fastify.post('/register', memberController.registerMember)
}

module.exports = routes