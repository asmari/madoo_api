const { Op } = require('sequelize');

const model = require('../../models/index');
const { ErrorResponse, ResponsePaginate, Response } = require('../../helper/response');

const Transaction = model.Transaction.Get;
const MemberCards = model.MembersCards.Get;
const LoyaltyMemberCards = model.LoyaltyMemberCards.Get;
const Loyalty = model.Loyalty.Get;
const Members = model.Members.Get;

const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const log = require('../../helper/Logger').logger;
// get detail transaction
exports.doGetDetailTransaction = async (request) => {
	const { user, query } = request;

	const member = await Members.findOne({
		paranoid: false,
		where: {
			id: user.id,
		},
	});

	let whereOptions = {};

	const loyaltyMemberCards = await LoyaltyMemberCards.findAll({
		attributes: ['id', 'member_cards_id'],
		paranoid: false,
		include: [
			{
				model: MemberCards,
				paranoid: false,
				where: {
					members_id: member.id,
				},
			},
		],
	});

	if (loyaltyMemberCards) {
		const idMemberCards = loyaltyMemberCards.map(value => value.member_cards_id);
		whereOptions = {
			[Op.or]: [
				{
					member_cards_id: {
						[Op.in]: idMemberCards,
					},
					conversion_member_cards_id: {
						[Op.in]: idMemberCards,
					},
				},
			],
		};
	}

	whereOptions.id = query.transaction_id;

	const transaction = await Transaction.findOne({
		where: whereOptions,
		paranoid: false,
		include: [
			{
				model: MemberCards,
				as: 'source_member_cards',
				paranoid: false,
				nested: true,
				include: [
					{
						model: LoyaltyMemberCards,
						nested: true,
						paranoid: false,
						attributes: ['member_cards_id', 'loyalty_id'],
						include: [
							{
								paranoid: false,
								model: Loyalty,
								attributes: ['name', 'unit'],
								nested: true,
							},
						],
					},
				],
				where: {
					id: {
						[Op.ne]: null,
					},
				},
			},
			{
				model: MemberCards,
				paranoid: false,
				as: 'target_member_cards',
				where: {
					id: {
						[Op.ne]: null,
					},
				},
				include: [
					{
						model: LoyaltyMemberCards,
						nested: true,
						paranoid: false,
						attributes: ['member_cards_id', 'loyalty_id'],
						include: [
							{
								model: Loyalty,
								paranoid: false,
								attributes: ['name', 'unit'],
								nested: true,
							},
						],
					},
				],
			},
		],
	});

	if (transaction) {
		return new Response(20058, transaction);
	}

	return new ErrorResponse(41727);
};

// get history transaction
exports.doGetListHistory = async (request) => {
	const { user, query } = request;

	const params = {
		page: parseInt(query.page, 10) || 1,
		item: parseInt(query.item, 10) || 10,
		filter_transaction: query.filter_transaction || [],
		filter_loyalty: query.filter_loyalty || [],
	};

	const member = await Members.findOne({
		where: {
			id: user.id,
		},
	});

	let whereOptions = {};

	if (!Array.isArray(params.filter_loyalty)) {
		params.filter_loyalty = [params.filter_loyalty];
	}

	if (params.filter_loyalty.length > 0) {
		const loyaltyMemberCards = await LoyaltyMemberCards.findAll({
			paranoid: false,
			where: {
				loyalty_id: {
					[Op.in]: params.filter_loyalty,
				},
			},
			attributes: ['id', 'member_cards_id'],
			include: [
				{
					model: MemberCards,
					where: {
						members_id: member.id,
					},
				},
			],
		});

		if (loyaltyMemberCards) {
			const idMemberCards = loyaltyMemberCards.map(value => value.member_cards_id);
			whereOptions = {
				[Op.or]: [
					{
						member_cards_id: {
							[Op.in]: idMemberCards,
						},
					},
					{
						conversion_member_cards_id: {
							[Op.in]: idMemberCards,
						},
					},
				],
			};
		}
	} else {
		const loyaltyMemberCards = await LoyaltyMemberCards.findAll({
			attributes: ['id', 'member_cards_id'],
			include: [
				{
					model: MemberCards,
					paranoid: false,
					where: {
						members_id: member.id,
					},
				},
			],
		});

		if (loyaltyMemberCards) {
			const idMemberCards = loyaltyMemberCards.map(value => value.member_cards_id);
			whereOptions = {
				[Op.or]: [
					{
						member_cards_id: {
							[Op.in]: idMemberCards,
						},
					},
					{
						conversion_member_cards_id: {
							[Op.in]: idMemberCards,
						},
					},
				],
			};
		}
	}

	try {
		const trxList = await Transaction.paginate({
			paranoid: false,
			page: params.page,
			paginate: params.item,
			where: whereOptions,
			order: [
				['id', 'DESC'],
			],
			attributes: {
				exclude: ['trxid', 'trxstatus'],
			},
			include: [
				{
					paranoid: false,
					model: MemberCards,
					as: 'source_member_cards',
					required: false,
					include: [
						{
							paranoid: false,
							model: LoyaltyMemberCards,
							required: false,
							include: [
								{
									paranoid: false,
									model: Loyalty,
									required: false,
									attributes: ['id', 'name', 'unit'],
								},
							],
						},
					],
				},
				{
					paranoid: false,
					model: MemberCards,
					required: false,
					as: 'target_member_cards',
					include: [
						{
							paranoid: false,
							required: false,
							model: LoyaltyMemberCards,
							include: [
								{
									paranoid: false,
									required: false,
									model: Loyalty,
									attributes: ['id', 'name', 'unit'],
								},
							],
						},
					],
				},
			],
		});

		const responseData = trxList.docs.map((value) => {
			const dVal = [];

			// console.log(value.toJSON());

			const d = value.toJSON();
			delete d.source_member_cards;
			delete d.target_member_cards;

			const listField = ['target'];

			const time = new Date(value.created_at);

			d.transaction_date = `${time.getDate()} ${monthList[time.getMonth()]} ${time.getFullYear()} ${time.getHours()}:${time.getMinutes()}`;

			listField.forEach((key) => {
				const reVal = {
					id: d.id,
					transaction_date: d.transaction_date,
					transaction_type: 'Point Conversion',
					unix_id: d.unix_id,
					status: d.status,
					point: key === 'source' ? -d.point : d.conversion_point,
					conversion_type: key,
					loyalty_unit: '',
					loyalty: '',
					loyalty_id: 0,
				};

				if (Object.prototype.hasOwnProperty.call(value, `${key}_member_cards`) && value[`${key}_member_cards`].length > 0) {
					const sourceLoyalty = value[`${key}_member_cards`][0].toJSON();
					// reVal.card_id = sourceLoyalty.id;
					reVal.loyalty = 'Not Found';
					reVal.loyalty_unit = '-';

					// console.log(sourceLoyalty);

					if (Object.prototype.hasOwnProperty.call(sourceLoyalty, 'loyalty_has_member_cards') && sourceLoyalty.loyalty_has_member_cards.length > 0) {
						const loyaltyCard = sourceLoyalty.loyalty_has_member_cards[0];

						if (Object.prototype.hasOwnProperty.call(loyaltyCard, 'loyalties') && loyaltyCard.loyalties.length > 0) {
							const loyalty = loyaltyCard.loyalties[0];
							reVal.loyalty = loyalty.name;
							reVal.loyalty_id = loyalty.id;

							if (loyalty.master_unit != null) {
								reVal.loyalty_unit = loyalty.master_unit.unit;
								reVal.loyalty_unit_title = loyalty.master_unit.title;
							} else {
								reVal.loyalty_unit = loyalty.unit;
								reVal.loyalty_unit_title = loyalty.unit;
							}
						}
					}
				}

				dVal.push(reVal);
			});

			return dVal.reverse();
		});

		// console.log(responseData);

		const resFinal = [];

		responseData.forEach((v) => {
			v.forEach((v1) => {
				if (v1.loyalty_id === 0) {
					return;
				}

				if (params.filter_loyalty.length > 0) {
					// console.log(v1);
					if (params.filter_loyalty.find(v2 => v2 === v1.loyalty_id)) {
						resFinal.push(v1);
					}
				} else {
					resFinal.push(v1);
				}
			});
		});

		return new ResponsePaginate(20030, {
			...trxList,
			item: params.item,
		}, resFinal);
	} catch (err) {
		throw new ErrorResponse(41798, {
			message: err.toString(),
		});
	}
};
