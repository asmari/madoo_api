const { Op } = require('sequelize');

const model = require('../../models/index');
const { ErrorResponse, ResponsePaginate } = require('../../helper/response');

const Transaction = model.Transaction.Get;
const MemberCards = model.MembersCards.Get;
const LoyaltyMemberCards = model.LoyaltyMemberCards.Get;
const Loyalty = model.Loyalty.Get;
const Members = model.Members.Get;

const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

	const whereOptions = {
		members_id: member.id,
	};

	if (!Array.isArray(params.filter_loyalty)) {
		params.filter_loyalty = [params.filter_loyalty];
	}

	if (params.filter_loyalty.length > 0) {
		const loyaltyMemberCards = await LoyaltyMemberCards.findAll({
			where: {
				loyalty_id: {
					[Op.in]: params.filter_loyalty,
				},
			},
			attributes: ['id'],
		});

		if (loyaltyMemberCards) {
			const idMemberCards = loyaltyMemberCards.map(value => value.id);

			whereOptions.id = {
				[Op.in]: idMemberCards,
			};
		}
	}

	try {
		const trxList = await Transaction.paginate({
			page: params.page,
			paginate: params.item,
			attributes: {
				exclude: ['trxid', 'trxstatus'],
			},
			include: [
				{
					model: MemberCards,
					as: 'source_member_cards',
					where: whereOptions,
					include: [
						{
							model: LoyaltyMemberCards,
							include: [
								{
									model: Loyalty,
									attributes: ['name', 'unit'],
								},
							],
						},
					],
				},
				{
					model: MemberCards,
					as: 'target_member_cards',
					include: [
						{
							model: LoyaltyMemberCards,
							include: [
								{
									model: Loyalty,
									attributes: ['name', 'unit'],
								},
							],
						},
					],
				},
			],
		});

		const responseData = trxList.docs.map((value) => {
			const dVal = [];

			const d = value.toJSON();
			delete d.source_member_cards;
			delete d.target_member_cards;

			const listField = ['source', 'target'];

			const time = new Date(value.created_at);

			d.transaction_date = `${time.getDate()} ${monthList[time.getMonth()]} ${time.getFullYear()}`;

			listField.forEach((key) => {
				const reVal = {
					id: d.id,
					transaction_date: d.transaction_date,
					transaction_type: 'Point Conversion',
					unix_id: d.unix_id,
					status: d.status,
					point: key === 'source' ? -d.point : d.conversion_point,
					loyalty_unit: '',
					loyalty: '',
				};

				if (Object.prototype.hasOwnProperty.call(value, `${key}_member_cards`) && value[`${key}_member_cards`].length > 0) {
					const sourceLoyalty = value[`${key}_member_cards`][0].toJSON();

					reVal.loyalty = 'Not Found';
					reVal.loyalty_unit = '-';

					if (Object.prototype.hasOwnProperty.call(sourceLoyalty, 'loyalty_has_member_cards') && sourceLoyalty.loyalty_has_member_cards.length > 0) {
						const loyaltyCard = sourceLoyalty.loyalty_has_member_cards[0];

						if (Object.prototype.hasOwnProperty.call(loyaltyCard, 'loyalties') && loyaltyCard.loyalties.length > 0) {
							const loyalty = loyaltyCard.loyalties[0];
							reVal.loyalty = loyalty.name;
							reVal.loyalty_unit = loyalty.unit;
						}
					}
				}

				dVal.push(reVal);
			});

			return dVal;
		});

		const resFinal = [];

		responseData.forEach((v) => {
			v.forEach((v1) => {
				resFinal.push(v1);
			});
		});

		return new ResponsePaginate(20030, {
			...trxList,
			item: params.item,
		}, resFinal);
	} catch (err) {
		console.log(err);
		throw new ErrorResponse(41798, {
			message: err.toString(),
		});
	}
};
