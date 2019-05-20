const masterController = require('../../controller/version-1/masterFilterController');
const masterSchema = require('../../schema/masterSchema');
// const RestClient = require('../../restclient');

module.exports = async (fastify) => {
	// get filter card list
	fastify.get('/filter/card', {
		...masterSchema.listCard,
		beforeHandler: [fastify.authenticate],
	}, masterController.getFilterListCard);

	// get sort card list
	fastify.get('/sort/card', {
		schema: {
			security: [
				{
					BearerAuth: [],
					'skip-auth': [],
				},
			],
		},
		beforeHandler: [fastify.authenticate],
	}, masterController.getSortListCard);

	// get filter notification list
	fastify.get('/filter/notification', {
		schema: {
			security: [
				{
					BearerAuth: [],
					'skip-auth': [],
				},
			],
		},
		beforeHandler: [fastify.authenticate],
	}, masterController.getFilterListNotification);

	// get filter promo list
	fastify.get('/filter/promo', {
		schema: {
			security: [
				{
					BearerAuth: [],
					'skip-auth': [],
				},
			],
		},
		beforeHandler: [fastify.authenticate],
	}, masterController.getFilterListPromo);

	// get type unlink social list
	fastify.get('/type/unlink/social', {
		schema: {
			security: [
				{
					BearerAuth: [],
					'skip-auth': [],
				},
			],
		},
		beforeHandler: [fastify.authenticate],
	}, masterController.getTypeUnlinkSocialMaster);

	// get type save member list
	fastify.get('/type/save_member', {
		schema: {
			security: [
				{
					BearerAuth: [],
					'skip-auth': [],
				},
			],
		},
		beforeHandler: [fastify.authenticate],
	}, masterController.getMasterTypeMembersSaveCard);

	// fastify.get('/list/otp', masterController.getOtpMember);
	// fastify.get('/list/forgot', masterController.getForgotMaster);
};
