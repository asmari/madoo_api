const sequelize = require('sequelize');
const helper = require('../../helper');
const model = require('../../models');

const { Op } = sequelize;

const Loyalty = model.Loyalty.Get;
const LoyaltyMemberCards = model.LoyaltyMemberCards.Get;
const LoyaltyType = model.LoyaltyType.Get;
const MemberCards = model.MembersCards.Get;
const Promo = model.Promo.Get;

// Delete Membercard loyalty
exports.doDeleteLoyaltyMemberCard = async (request, reply) => {
	try {
		const { user } = request;
		const params = request.body || {};

		if (!Object.prototype.hasOwnProperty.call(params, 'member_cards_id')) {
			throw new Error({
				message: 'Field member_cards_id is required',
			});
		}

		const memberCard = await MemberCards.findOne({
			where: {
				members_id: user.id,
				id: params.member_cards_id,
			},
			include: [LoyaltyMemberCards],
		});

		if (memberCard != null) {
			memberCard.destroy();
			reply.send(helper.Success({
				delete: true,
			}));
		}

		reply.send(helper.Success({
			delete: false,
		}));
	} catch (err) {
		reply.send(helper.Fail(err));
	}
};

// Get Detail Member Card with loyalty
exports.getDetailMember = async (request, reply) => {
	try {
		const params = JSON.parse(JSON.stringify(request.query)) || {};
		const { user } = request;

		MemberCards.hasMany(LoyaltyMemberCards, {
			foreignKey: 'member_cards_id',
			sourceKey: 'id',
			onDelete: 'CASCADE',
		});

		// console.log(params);

		if (request.validationError) {
			throw (request.validationError);
		}

		if (!Object.prototype.hasOwnProperty.call(params, 'loyalty_id')) {
			throw new Error('Field loyalty_id not found');
		}

		MemberCards.findOne({
			where: {
				members_id: user.id,
			},
			include: [{
				model: LoyaltyMemberCards,

				include: [{
					model: Loyalty,
					required: true,
					where: {
						id: params.loyalty_id,
					},
				}],
			}],
		})
			.then(async (memberCards) => {
				const memberCardsTemp = memberCards;
				if (memberCards != null) {
					if (memberCards.loyalty_has_member_cards) {
						const loyaltyCards = memberCards.loyalty_has_member_cards;
						if (loyaltyCards != null) {
							const { loyalty } = loyaltyCards;

							if (loyalty != null) {
								const promo = await Promo.findAll({
									raw: true,
									where: {
										loyalty_id: loyalty.id,
									},
								});

								if (promo != null) {
									loyalty.dataValues.promo = promo;
								} else {
									loyalty.dataValues.promo = [];
								}

								loyaltyCards.dataValues.loyalty = loyalty;
								memberCardsTemp.loyalty_has_member_cards[0] = loyaltyCards;
							}
						}

						reply.send(helper.Success(memberCardsTemp));
					} else {
						reply.send(helper.Fail({
							message: 'Member cards with loyalty not found!',
							statusCode: 404,
						}));
					}
				} else {
					reply.send(helper.Fail({
						message: 'Member cards with loyalty not found!',
						statusCode: 404,
					}));
				}
			})
			.catch((err) => {
				reply.send(helper.Fail(err));
			});
	} catch (err) {
		reply.send(helper.Fail(err));
	}
};

// List Detail Member Card
exports.getLoyaltyMember = async (request, reply) => {
	try {
		const { user } = request;

		const params = {
			page: parseInt(request.query.page, 10) || 1,
			item: parseInt(request.query.item, 10) || 5,
			search: request.query.search || null,
			sort: request.query.sort || null,
			filter: request.query.filter || [],
			total: 0,
		};

		// console.log(request.query);

		let orderLoyalty = [
			'id', 'ASC',
		];

		let orderCards = [
			'id', 'ASC',
		];

		if (params.sort != null && typeof (params.sort) === 'string') {
			switch (params.sort) {
			case 'alphabet':
				orderLoyalty = [Loyalty, 'name', 'ASC'];
				break;

			case 'point_low':
				orderCards = ['point', 'ASC'];
				break;

			case 'point_high':
				orderCards = ['point', 'DESC'];
				break;

			default:

				break;
			}
		}

		MemberCards.findAll({
			where: {
				members_id: user.id,
			},
			order: [
				orderCards,
			],
		})
			.then((cards) => {
				const cardsId = cards.map(value => value.id);

				const whereLoyalty = {};

				if (orderCards.length > 0 && orderCards[0] === 'point') {
					orderLoyalty = sequelize.literal(`FIELD(member_cards_id, ${cardsId.join(',')}) ASC`);
				}

				if (typeof (params.filter) !== 'string' && params.filter.length > 0) {
					const loyaltyId = params.filter.map(value => parseInt(value, 10));

					whereLoyalty.id = {
						[Op.in]: loyaltyId,
					};
				} else if (typeof params.filter !== 'undefined' && params.filter.length > 0) {
					if (!parseInt(params.filter, 10)) {
						whereLoyalty.id = {
							[Op.in]: [parseInt(params.filter, 10)],
						};
					}
				}

				if (params.search != null && typeof (params.search) === 'string') {
					whereLoyalty.name = {
						[Op.like]: `%${params.search}%`,
					};
				}

				const dataOptions = {
					page: params.page,
					paginate: params.item,
					where: {
						member_cards_id: {
							[Op.in]: cardsId,
						},
					},
					order: [
						orderLoyalty,
					],
					include: [{
						model: Loyalty,
						where: whereLoyalty,
					}, {
						model: MemberCards,
					}],
				};

				// return LoyaltyMemberCards.findAll(dataOptions)
				// .then((number) => {

				//     let count = 0

				//     number.forEach((value) => {
				//         value.loyalty.forEach((val) => {
				//             count += 1
				//         })
				//     })

				//     console.log(count)

				return new Promise(async (resolve, reject) => {
					try {
						const paginateCards = await LoyaltyMemberCards.paginate(dataOptions);
						const countPaginateCards = await LoyaltyMemberCards.findAndCountAll(dataOptions);
						resolve([paginateCards, countPaginateCards]);
					} catch (err) {
						reject(err);
					}
				});
				// })
			})
			.then(async (loyaltyCards) => {
				const data = loyaltyCards[0].docs;
				reply.send(helper.Paginate({
					item: params.item,
					pages: params.page,
					total: loyaltyCards[1].count,
				}, data));
			})
			.catch((err) => {
				reply.send(helper.Fail(err));
			});
	} catch (err) {
		reply.send(helper.Fail(err));
	}
};

// list loyalty
exports.getListLoyalty = async (request, reply) => {
	try {
		const data = await LoyaltyType.findAll({
			order: [
				['id', 'ASC'],
			],
			include: [Loyalty],
		});

		reply.send(helper.Success(data));
	} catch (err) {
		reply.send(helper.Fail(err));
	}
};

// get detail loyalty
exports.getDetailLoyalty = async (request, reply) => {
	try {
		const query = JSON.parse(JSON.stringify(request.query));

		const loyalty = await Loyalty.findOne({
			where: {
				id: query.loyalty_id,
			},
			include: [Promo],
		});


		reply.send(helper.Success(loyalty));
	} catch (err) {
		reply.send(helper.Fail(err));
	}
};
