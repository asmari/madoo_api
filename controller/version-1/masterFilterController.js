const { Op } = require('sequelize');

const helper = require('../../helper');
const {
	Loyalty,
	LoyaltyMemberCards,
	MembersCards,
	Promo,
} = require('../../models');

// list filter promo content
exports.getFilterListPromo = async (request, reply) => {
	try {
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

			reply.send(helper.Success(data));
		}

		throw new Error('Member cards not found');
	} catch (err) {
		reply.send(helper.Fail(err));
	}
};

// list sort card content
exports.getSortListCard = async (request, reply) => {
	reply.send(helper.Success([
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
	]));
};

// list filter card content
exports.getFilterListCard = async (request, reply) => {
	try {
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

			reply.send(helper.Success(data));
		}

		throw new Error('Member cards not found');
	} catch (err) {
		reply.send(helper.Fail(err));
	}
};
