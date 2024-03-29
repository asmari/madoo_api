const loyaltySchema = require('../../schema/loyaltySchema');
const loyaltyController = require('../../controller/version-1/loyaltyController');


async function routes(fastify) {
	// list member
	fastify.get('/list/card', {
		...loyaltySchema.loyaltyMemberListSchema,
		beforeHandler: [fastify.authenticate],
	}, loyaltyController.getLoyaltyMember);

	// detail member
	fastify.get('/detail/card', {
		...loyaltySchema.loyaltyMemberDetailSchema,
		beforeHandler: [fastify.authenticate],
	}, loyaltyController.getDetailMember);

	// check member card required field
	fastify.get('/check/card/field', {
		...loyaltySchema.loyaltyCheckRequiredField,
		beforeHandler: [fastify.authenticate],
	}, loyaltyController.doCheckRequired);

	// check member card
	fastify.get('/check/card/point', {
		...loyaltySchema.loyaltyCheckMemberSchema,
		beforeHandler: [fastify.authenticate],
	}, loyaltyController.doCheckMemberCardPoint);

	// check member card
	fastify.get('/check/card', {
		...loyaltySchema.loyaltyCheckMemberSchema,
		beforeHandler: [fastify.authenticate],
	}, loyaltyController.doCheckMemberCard);

	// save member card
	fastify.post('/save/card', {
		...loyaltySchema.loyaltySaveMemberCardSchema,
		beforeHandler: [fastify.authenticate],
	}, loyaltyController.doSaveMemberCard);

	// list loyalty with type
	fastify.get('/list', {
		...loyaltySchema.loyaltyListSchema,
		beforeHandler: [fastify.authenticate],
	}, loyaltyController.getListLoyalty);

	// detail loyalty with promo
	fastify.get('/detail', {
		...loyaltySchema.loyaltyDetailSchema,
		beforeHandler: [fastify.authenticate],
	}, loyaltyController.getDetailLoyalty);

	fastify.post('/delete/card', {
		...loyaltySchema.loyaltyDeleteMembercard,
		beforeHandler: [fastify.authenticate],
	}, loyaltyController.doDeleteLoyaltyMemberCard);

	// trigger refresh token all member cards
	fastify.get('/refresh/auth', loyaltyController.doRefreshLoyaltyAuthCard);
}

module.exports = routes;
