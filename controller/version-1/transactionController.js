const { Op } = require('sequelize');

const model = require('../../models/index');
const { ErrorResponse, ResponsePaginate } = require('../../helper/response');

const Transaction = model.Transaction.Get;
const MemberCards = model.MembersCards.Get;
const LoyaltyMemberCards = model.LoyaltyMemberCards.Get;
const Members = model.Members.Get;

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
				},
				{
					model: MemberCards,
					as: 'target_member_cards',
				},
			],
		});

		return new ResponsePaginate(20030, {
			...trxList,
			item: params.item,
		});
	} catch (err) {
		console.log(err);
		throw new ErrorResponse(41798, {
			message: err.toString(),
		});
	}
};
