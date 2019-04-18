const { Op } = require('sequelize');

const { ErrorResponse, Response } = require('../../helper/response');
const {
	Loyalty,
	LoyaltyMemberCards,
	MembersCards,
	Promo,
} = require('../../models');

// list filter promo content
exports.getFilterListPromo = async (request) => {
	const { user } = request;

	const memberCards = await MembersCards.Get.findAll({
		where: {
			members_id: user.id,
		},
	});

	if (memberCards) {
		const memberCardsId = memberCards.map(value => value.id);

		const promo = await Promo.Get.findAll({
			loyalty_id: {
				[Op.in]: memberCardsId,
			},
		});

		const promoMemberId = promo.map(value => value.loyalty_id);

		const loyaltyMemberCards = await LoyaltyMemberCards.Get.findAll({
			where: {
				member_cards_id: {
					[Op.in]: promoMemberId,
				},
			},
			include: [
				{
					model: Loyalty.Get,
				},
			],
		});

		const data = loyaltyMemberCards.map((value) => {
			const innerData = value.loyalties.map(value2 => ({
				id: value2.id,
				name: value2.name,
			}));

			return innerData[0] || [];
		});

		return new Response(20016, data);
	}

	// Error: Member cards not found
	throw new ErrorResponse(41705);
};

// list sort card content
exports.getSortListCard = async () => new Response(20017, [
	{
		id: 'alphabet',
		name: 'Alphabetical',
	}, {
		id: 'point_low',
		name: 'Point Low to High',
	}, {
		id: 'point_high',
		name: 'Point High to Low',
	},
]);

// list sort card content
exports.getFilterListNotification = async () => new Response(20017, [
	{
		id: 'promotion',
		name: 'Promotion',
	}, {
		id: 'convertion',
		name: 'Convertion',
	}, {
		id: 'other',
		name: 'Other',
	},
]);

// list filter card content
exports.getFilterListCard = async (request) => {
	const { user } = request;

	const memberCards = await MembersCards.Get.findAll({
		where: {
			members_id: user.id,
		},
	});

	if (memberCards) {
		const memberCardsId = memberCards.map(value => value.id);

		const loyaltyMemberCards = await LoyaltyMemberCards.Get.findAll({
			where: {
				member_cards_id: {
					[Op.in]: memberCardsId,
				},
			},
			include: [
				{
					model: Loyalty.Get,
				},
			],
		});


		const data = loyaltyMemberCards.map((value) => {
			const innerData = value.loyalties.map(value2 => ({
				id: value2.id,
				name: value2.name,
			}));

			return innerData[0] || [];
		});

		return new Response(20018, data);
	}

	throw new ErrorResponse(41705);
};
