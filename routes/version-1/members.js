const memberSchema = require('../../schema/memberSchema');
const memberController = require('../../controller/version-1/memberController');

async function routes(fastify) {
	// get members
	fastify.get('/', memberController.memberIndex);

	// register members
	fastify.post('/register/phone', memberSchema.registerSchema, memberController.doRegisterPhone);

	// OTP validation
	fastify.post('/otp/validation', memberSchema.otpSchema, memberController.doOtpValidation);

	// Save Member
	fastify.post('/register/save', memberSchema.memberSchema, memberController.doSaveMember);

	// get detail members
	fastify.get('/detail', {
		...memberSchema.memberDetailSchema,
		beforeHandler: [fastify.authenticate],
	}, memberController.memberDetail);

	// validate pin
	fastify.post('/pin/validation', {
		...memberSchema.pinValidationSchema,
		beforeHandler: [fastify.authenticate],
	}, memberController.doPinValidation);
}

module.exports = routes;
