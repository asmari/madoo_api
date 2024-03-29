const authController = require('../../controller/version-1/authController');

const authSchema = require('../../schema/authSchema');

async function routes(fastify) {
	// get members
	fastify.get('/', { schema: { hide: true } }, authController.authIndex);

	// login members
	fastify.post('/login', authSchema.authLoginSchema, authController.doLogin);

	// check member
	fastify.post('/check', authSchema.authCheckSchema, authController.doCheckMember);

	// send otp forgot pin
	fastify.post('/forgot/pin/otp', authSchema.authForgotPinOtp, authController.setForgotPinOtp);

	// check otp forgot pin
	fastify.post('/forgot/pin/otp/check', authSchema.authForgotPinOtpCheck, authController.checkForgotPinOtp);

	// change pin and login
	fastify.post('/forgot/pin/change', authSchema.authChangePin, authController.doChangePin);

	// unlink social media
	fastify.post('/unlink/social', {
		...authSchema.authUnlinkSocialSchema,
		beforeHandler: [fastify.authenticate],
	}, authController.doUnlinkSocialMedia);
	// unlink social media
	fastify.post('/link/social', {
		...authSchema.authLinkSocialSchema,
		beforeHandler: [fastify.authenticate],
	}, authController.doLinkSocialMedia);
}

module.exports = routes;
