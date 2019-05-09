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

	// change pin
	fastify.post('/pin/change', {
		...memberSchema.changePinSchema,
		beforeHandler: [fastify.authenticate],
	}, memberController.doChangePin);

	// update member without phone number
	fastify.post('/update', {
		...memberSchema.updateMemberSchema,
		beforeHandler: [fastify.authenticate],
	}, memberController.doUpdateMember);

	// send otp update mobile phone
	fastify.post('/update/otp/send', {
		...memberSchema.sendOtpUpdateSchema,
		beforeHandler: [fastify.authenticate],
	}, memberController.doSendOtpUpdateMember);

	// check otp update mobile phone
	fastify.post('/update/otp/check', {
		...memberSchema.checkOtpUpdateSchema,
		beforeHandler: [fastify.authenticate],
	}, memberController.doCheckOtpUpdateMember);
}

module.exports = routes;
