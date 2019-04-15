
const facebookSchema = require('../../schema/facebookAuthSchema');
const facebookController = require('../../controller/version-1/facebookAuthController');

async function routes(fastify) {
	// login facebook
	fastify.post('/login', facebookSchema.facebookLoginSchema, facebookController.doLoginFacebook);

	// register facebook oauth data
	fastify.post('/register', facebookSchema.facebookRegisterSchema, facebookController.doRegisterFacebook);

	// save member facebook oauth data
	fastify.post('/register/save', facebookSchema.facebookSaveMemberSchema, facebookController.doSaveMember);
}


module.exports = routes;
