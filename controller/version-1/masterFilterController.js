const { Op } = require('sequelize');

const { ErrorResponse, Response } = require('../../helper/response');
const model = require('../../models');
const {
	Loyalty,
	LoyaltyType,
	LoyaltyMemberCards,
	MembersCards,
	Otp,
	ForgotPassword,
	Members,
	MembersRegister,
} = require('../../models');

const MemberCards = model.MembersCards.Get;

// list filter point
exports.getFilterPoint = async (request) => {
	const { user } = request;
	const whereSearch = {};
	const cards = await MemberCards.findAll({
		where: {
			members_id: user.id,
		},
		attributes: ['id'],
	});

	const cardsId = cards.map(value => value.id);

	const loyaltyHasCards = await LoyaltyMemberCards.Get.findAll({
		where: {
			member_cards_id: {
				[Op.in]: cardsId,
			},
		},
		attributes: ['loyalty_id'],
	});

	const loyaltyId = loyaltyHasCards.map(value => value.loyalty_id);

	whereSearch.id = {
		[Op.in]: loyaltyId,
	};


	const loyalty = await Loyalty.Get.findAll({
		where: {
			...whereSearch,
		},
		attributes: ['id', 'name'],
	});

	return new Response(20016, loyalty);
};

// list filter promo content
exports.getFilterListPromo = async () => {
	const category = await LoyaltyType.Get.findAll({
		attributes: ['id', 'title'],
	});

	const loyalty = await Loyalty.Get.findAll({
		attributes: ['id', 'name'],
	});

	return new Response(20016, {
		category,
		loyalty,
	});
};

// list sort card content
exports.getSortListCard = async () => new Response(20017, [
	{
		id: 1,
		name: 'Alphabetical',
	}, {
		id: 2,
		name: 'Point Low to High',
	}, {
		id: 3,
		name: 'Point High to Low',
	},
]);

// list sort card content
exports.getFilterListNotification = async () => new Response(20017, [
	{
		id: 1,
		name: 'Promotion',
	}, {
		id: 2,
		name: 'Convertion',
	}, {
		id: 3,
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


		const data = loyaltyMemberCards.map(value => value.loyalties[0].type_loyalty_id);


		const filter = await LoyaltyType.Get.findAll({
			where: {
				id: {
					[Op.in]: data,
				},
			},
			attributes: ['id', ['title', 'name']],
		});

		return new Response(20018, filter);
	}

	throw new ErrorResponse(41705);
};

exports.getTypeUnlinkSocialMaster = async () => new Response(20099, [
	{
		id: 1,
		name: 'Facebook',
	},
	{
		id: 2,
		name: 'Google',
	},
]);

exports.getMasterTypeMembersSaveCard = async () => new Response(20099, [
	{
		id: 1,
		name: 'Email',
	},
	{
		id: 2,
		name: 'Card Number',
	},
	{
		id: 3,
		name: 'Mobile Phone',
	},
]);


exports.getForgotMaster = async () => {
	ForgotPassword.Get.hasMany(Members.Get, {
		sourceKey: 'members_id',
		foreignKey: 'id',
	});

	const forgot = await ForgotPassword.Get.findAll({
		include: [
			Members.Get,
		],
		order: [[
			'updated_at', 'DESC',
		]],
	});

	return new Response(20001, forgot);
};

exports.getOtpMember = async () => {
	Otp.Get.hasMany(MembersRegister.Get, {
		foreignKey: 'id',
		sourceKey: 'members_id',
	});
	const otpMember = await Otp.Get.findAll({
		include: [
			{
				model: MembersRegister.Get,
			},
		],
		order: [
			['updated_at', 'DESC'],
		],
	});

	return new Response(20001, otpMember);
};
