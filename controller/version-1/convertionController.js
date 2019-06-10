const sequelize = require('sequelize');
const randomstring = require('randomstring');
const model = require('../../models');
const { ErrorResponse, Response, ResponsePaginate } = require('../../helper/response');
const LoyaltyRequest = require('../../restclient/LoyaltyRequest');
const EmailSender = require('../../helper/EmailSender');
const FcmSender = require('../../helper/FcmSender');
const Logger = require('../../helper/Logger').Convertion;

const { Op } = sequelize;
const ConvertionRate = model.ConvertionRate.Get;
const Conversion = model.Conversion.Get;
const Loyalty = model.Loyalty.Get;
const LoyaltyMemberCards = model.LoyaltyMemberCards.Get;
const Member = model.Members.Get;
const Notification = model.Notification.Get;
const NotificationMember = model.NotificationMembers.Get;
const MemberCards = model.MembersCards.Get;
const Transaction = model.Transaction.Get;
const TransactionLog = model.TransactionLog.Get;

exports.checkConvertionRate = async (request) => {
	const whereCondition = {};
	// const whereSource = {};
	const whereTarget = {};
	const allowedTo = [];
	const allowedFrom = [];

	const params = JSON.parse(JSON.stringify(request.query));


	if (params.loyalty_id != null) {
		const conversionRule = await Conversion.findOne({ where: { loyalty_id: params.loyalty_id } });
		const conversionData = JSON.parse(conversionRule.data_conversion);

		if (Object.prototype.hasOwnProperty.call(conversionData, 'loyalty_from') && conversionData.loyalty_from != null) {
			conversionData.loyalty_from.forEach((id) => {
				allowedFrom.push(id);
			});
		}
		if (Object.prototype.hasOwnProperty.call(conversionData, 'loyalty_to') && conversionData.loyalty_to != null) {
			conversionData.loyalty_to.forEach((id) => {
				allowedTo.push(id);
			});
		}
		if (params.conversion_type === 'from') {
			whereCondition.loyalty_id = params.loyalty_id;
			if (params.search != null && typeof (params.search) === 'string') {
				whereTarget.name = {
					[Op.like]: `%${params.search}%`,
				};
			}
		} else {
			// whereCondition.conversion_loyalty = params.loyalty_id;
			// if (params.search != null && typeof (params.search) === 'string') {
			// 	whereSource.name = {
			// 		[Op.like]: `%${params.search}%`,
			// 	};
			// }
		}
	}

	if (allowedFrom.length !== 0) {
		whereCondition[Op.and] = {
			loyalty_id: {
				[Op.in]: allowedFrom,
			},
		};
	}
	if (allowedTo.length !== 0) {
		whereCondition[Op.and] = {
			conversion_loyalty: {
				[Op.in]: allowedTo,
			},
		};
	}

	const rate = await ConvertionRate.findOne({
		where: {
			loyalty_id: params.loyalty_id_source,
			conversion_loyalty: params.loyalty_id_target,
			...whereCondition,
		},
		include: [{
			model: Loyalty,
			as: 'Source',
			required: true,
			attributes: ['id', 'name', 'unit'],
		}, {
			model: Loyalty,
			as: 'Target',
			required: true,
			attributes: ['id', 'name', 'unit'],
		}],
	});

	if (rate) {
		const point = params.point_to_convert;

		// const source = await Loyalty.findOne({
		// 	where: {
		// 		id: params.loyalty_id_source,
		// 	},
		// });

		if (point % rate.multiple !== 0) {
			// Error: :message
			throw new ErrorResponse(42298, {
				message: `Point not multiply by ${rate.multiple}`,
			});
		}

		if (point < rate.minimum) {
			// Error: :message
			throw new ErrorResponse(42298, {
				message: `Point is less than ${rate.minimum}`,
			});
		}

		const newPoint = (rate.point_conversion / rate.point_loyalty) * point;

		return new Response(20003, {
			...params,
			point_converted: newPoint,
			from: rate.Source || {},
			to: rate.Target || {},
		});
	}
	// Error: Convertion rate not found
	throw new ErrorResponse(41702);
};


exports.doConvertionPoint = async (request) => {
	const whereCondition = {};
	// const whereSource = {};
	const whereTarget = {};
	const allowedTo = [];
	const allowedFrom = [];
	const { user } = request;

	const params = request.body;


	if (params.loyalty_id != null) {
		const conversionRule = await Conversion.findOne({ where: { loyalty_id: params.loyalty_id } });
		const conversionData = JSON.parse(conversionRule.data_conversion);

		if (Object.prototype.hasOwnProperty.call(conversionData, 'loyalty_from') && conversionData.loyalty_from != null) {
			conversionData.loyalty_from.forEach((id) => {
				allowedFrom.push(id);
			});
		}
		if (Object.prototype.hasOwnProperty.call(conversionData, 'loyalty_to') && conversionData.loyalty_to != null) {
			conversionData.loyalty_to.forEach((id) => {
				allowedTo.push(id);
			});
		}
		if (params.conversion_type === 'from') {
			whereCondition.loyalty_id = params.loyalty_id;
			if (params.search != null && typeof (params.search) === 'string') {
				whereTarget.name = {
					[Op.like]: `%${params.search}%`,
				};
			}
		} else {
			// whereCondition.conversion_loyalty = params.loyalty_id;
			// if (params.search != null && typeof (params.search) === 'string') {
			// 	whereSource.name = {
			// 		[Op.like]: `%${params.search}%`,
			// 	};
			// }
		}
	}

	if (allowedFrom.length !== 0) {
		whereCondition[Op.and] = {
			loyalty_id: {
				[Op.in]: allowedFrom,
			},
		};
	}
	if (allowedTo.length !== 0) {
		whereCondition[Op.and] = {
			conversion_loyalty: {
				[Op.in]: allowedTo,
			},
		};
	}

	const loyaltySource = await Loyalty.findOne({
		where: {
			id: params.loyalty_id_source,
		},
		attributes: ['id', 'name', 'unit'],
	});

	if (!loyaltySource) {
		throw new ErrorResponse(41722);
	}

	const loyaltyTarget = await Loyalty.findOne({
		where: {
			id: params.loyalty_id_target,
		},
		attributes: ['id', 'name', 'unit'],
	});

	if (!loyaltyTarget) {
		throw new ErrorResponse(41723);
	}

	const memberCardSource = await LoyaltyMemberCards.findOne({
		where: {
			loyalty_id: params.loyalty_id_source,
		},
		include: [
			{
				model: MemberCards,
				where: {
					members_id: user.id,
				},
			},
		],
	});

	if (memberCardSource == null) {
		return new ErrorResponse(41715, {
			loyalty: loyaltySource.name,
		});
	}

	const memberCardTarget = await LoyaltyMemberCards.findOne({
		where: {
			loyalty_id: params.loyalty_id_target,
		},
		include: [
			{
				model: MemberCards,
				where: {
					members_id: user.id,
				},
			},
		],
	});

	if (memberCardTarget == null) {
		return new ErrorResponse(41715, {
			loyalty: loyaltyTarget.name,
		});
	}

	const rate = await ConvertionRate.findOne({
		where: {
			loyalty_id: params.loyalty_id_source,
			conversion_loyalty: params.loyalty_id_target,
			...whereCondition,
		},
		include: [{
			model: Loyalty,
			as: 'Source',
			required: true,
			attributes: ['id', 'name', 'unit'],
		}, {
			model: Loyalty,
			as: 'Target',
			required: true,
			attributes: ['id', 'name', 'unit'],
		}],
	});


	if (rate) {
		if (params.point_to_convert % rate.multiple !== 0) {
			// Error: :message
			throw new ErrorResponse(41721, {
				point: rate.multiple,
			});
		}

		if (params.point_to_convert < rate.minimum) {
			// Error: :message
			throw new ErrorResponse(41720, {
				point: rate.minimum,
			});
		}

		const rateWithFee = (rate.point_conversion / rate.point_loyalty);
		const rateWithoutFee = (rate.mid_from_rate / rate.mid_to_rate);
		const pointWithFee = rateWithFee * params.point_to_convert;
		const pointWoFee = rateWithoutFee * params.point_to_convert;
		const fee = pointWoFee - pointWithFee;

		const cardSource = memberCardSource.member_cards[0];
		const cardTarget = memberCardTarget.member_cards[0];

		const sourceRequest = new LoyaltyRequest();
		await sourceRequest.setLoyaltyId(loyaltySource.id);
		sourceRequest.setMemberCardId(cardSource.id);

		const sourceNewPoint = await sourceRequest.getMemberPoint();

		if (sourceNewPoint.status) {
			let sourcePoint = cardSource.point_balance;

			sourceNewPoint.data.forEach((val) => {
				if (val.keyName === 'point_balance') {
					sourcePoint = val.value;
				}
			});

			await cardSource.update({
				point_balance: sourcePoint,
			});
		}

		const targetRequest = new LoyaltyRequest();
		await targetRequest.setLoyaltyId(loyaltyTarget.id);
		targetRequest.setMemberCardId(cardTarget.id);

		const targetNewPoint = await targetRequest.getMemberPoint();

		if (targetNewPoint.status) {
			let targetPoint = cardTarget.point_balance;

			targetNewPoint.data.forEach((val) => {
				if (val.keyName === 'point_balance') {
					targetPoint = val.value;
				}
			});

			await cardTarget.update({
				point_balance: targetPoint,
			});
		}

		if (cardSource.point_balance < params.point_to_convert) {
			return new ErrorResponse(41716, {
				loyalty: loyaltySource.name,
			});
		}

		const transaction = await Transaction.create({
			unix_id: randomstring.generate({
				length: 8,
				charset: 'numeric',
			}),
			member_cards_id: cardSource.id,
			conversion_member_cards_id: cardTarget.id,
			point: params.point_to_convert,
			conversion_point: pointWithFee,
			point_balance: cardSource.point_balance,
			point_balance_after: (cardSource.point_balance - params.point_to_convert),
			conversion_point_balance: cardTarget.point_balance,
			conversion_point_balance_after: (cardTarget.point_balance + pointWithFee),
			status: 'pending',
			fee,
		});

		const responseDone = new Promise(async (resolve, reject) => {
			const successResponse = {
				deduct: false,
				add: false,
			};

			try {
				Logger.info('Start Convertion', transaction);

				const resMinusPoint = await sourceRequest.pointMinus({
					point: params.point_to_convert,
				});

				Logger.info('Response Minus', resMinusPoint);

				successResponse.deduct = resMinusPoint.status;

				await TransactionLog.create({
					unix_id: transaction.unix_id,
					type_trx: 'point_minus',
					status: resMinusPoint.status ? 1 : 0,
					member_cards_id: cardSource.id,
					point_balance: params.point_to_convert,
					response_third_party: JSON.stringify(resMinusPoint),
				});

				if (resMinusPoint.status) {
					let pointMinus = cardSource.point_balance;

					resMinusPoint.data.forEach((val) => {
						if (val.keyName === 'point_balance') {
							pointMinus = val.value;
						}
					});

					await cardSource.update({
						point_balance: pointMinus,
					});
				}

				const resAddPoint = await targetRequest.pointAdd({
					point: pointWithFee,
				});

				Logger.info('Response Add', resAddPoint);

				successResponse.add = resAddPoint.status;

				await TransactionLog.create({
					unix_id: transaction.unix_id,
					type_trx: 'point_add',
					status: resAddPoint.status ? 1 : 0,
					member_cards_id: cardTarget.id,
					point_balance: pointWithFee,
					response_third_party: JSON.stringify(resAddPoint),
				});

				if (resAddPoint.status) {
					let pointAdd = cardSource.point_balance;

					resAddPoint.data.forEach((val) => {
						if (val.keyName === 'point_balance') {
							pointAdd = val.value;
						}
					});

					await cardTarget.update({
						point_balance: pointAdd,
					});
				}

				if (successResponse.add && successResponse.deduct) {
					await transaction.update({
						status: 'success',
					});

					const member = await Member.findOne({
						where: {
							id: user.id,
						},
					});

					const date = new Date(transaction.created_at);

					if (member) {
						const emailSender = new EmailSender();
						await emailSender.sendConversion(member.email, {
							name: member.full_name,
							date: `${date.getDate()} ${date.getMonth() + 1} ${date.getFullYear()}`,
							conversionId: transaction.unix_id,
							loyaltySource: loyaltySource.name,
							pointSource: params.point_to_convert,
							unitSource: loyaltySource.unit,
							loyaltyTarget: loyaltyTarget.name,
							pointTarget: pointWithFee,
							unitTarget: loyaltyTarget.unit,
							currentPointSource: transaction.point_balance_after,
							currentPointTarget: transaction.conversion_point_balance_after,
						});
					}
				} else {
					await transaction.update({
						status: 'failed',
					});
				}

				const notification = await Notification.create({
					loyalty_id: loyaltySource.id,
					type: 'conversion',
					promo_id: 0,
					title: `Conversion ${transaction.status}`,
					valid_until: new Date(),
					description: 'Conversion Success',
				});

				if (notification) {
					await NotificationMember.create({
						members_id: user.id,
						notification_id: notification.id,
						read: 0,
					});

					await FcmSender.sendToUser(user.id, {
						data: {
							param: JSON.stringify({
								id: notification.id,
								title: notification.title,
								type: notification.type,
								loyalty_id: notification.loyalty_id,
							}),
							image: notification.image || null,
						},
						priority: 'normal',
						notification: {
							title: notification.title,
							body: notification.description,
							clickAction: notification.click,
						},
					});
				}

				Logger.info('End Transaction', transaction);
				resolve(new Response(20052, transaction));
			} catch (err) {
				Logger.trace(err);
				reject(err);
			}
		});

		const responseTimeout = new Promise((resolve) => {
			setTimeout(() => resolve(new Response(20200, transaction)), 30000);
		});

		return Promise.race([responseDone, responseTimeout]);
	}

	return new ErrorResponse(41717, {
		source: loyaltySource.name,
		target: loyaltyTarget.name,
	});
};


exports.getConvertionRate = async (request) => {
	const whereCondition = {};
	const whereSource = {};
	const whereTarget = {};
	const allowedTo = [];
	const allowedFrom = [];

	const params = JSON.parse(JSON.stringify(request.query));

	params.page = parseInt(params.page, 10) || 1;
	params.item = parseInt(params.item, 10) || 10;


	if (params.loyalty_id != null) {
		const conversionRule = await Conversion.findOne({ where: { loyalty_id: params.loyalty_id } });
		const conversionData = JSON.parse(conversionRule.data_conversion);

		if (Object.prototype.hasOwnProperty.call(conversionData, 'loyalty_from') && conversionData.loyalty_from != null) {
			conversionData.loyalty_from.forEach((id) => {
				allowedFrom.push(id);
			});
		}
		if (Object.prototype.hasOwnProperty.call(conversionData, 'loyalty_to') && conversionData.loyalty_to != null) {
			conversionData.loyalty_to.forEach((id) => {
				allowedTo.push(id);
			});
		}
		if (params.conversion_type === 'from') {
			whereCondition.loyalty_id = params.loyalty_id;
			if (params.search != null && typeof (params.search) === 'string') {
				whereTarget.name = {
					[Op.like]: `%${params.search}%`,
				};
			}
		} else {
			whereCondition.conversion_loyalty = params.loyalty_id;
			if (params.search != null && typeof (params.search) === 'string') {
				whereSource.name = {
					[Op.like]: `%${params.search}%`,
				};
			}
		}
	}

	if (allowedFrom.length !== 0) {
		whereCondition[Op.and] = {
			loyalty_id: {
				[Op.in]: allowedFrom,
			},
		};
	}
	if (allowedTo.length !== 0) {
		whereCondition[Op.and] = {
			conversion_loyalty: {
				[Op.in]: allowedTo,
			},
		};
	}

	const targetConversion = 'minimum';

	const dataOptions = {
		attributes: [[targetConversion, 'source_point'], [sequelize.literal(`((point_conversion/point_loyalty)) * ${targetConversion}`), 'target_point']],
		include: [{
			model: Loyalty,
			as: 'Source',
			required: true,
			where: whereSource,
			attributes: ['id', 'name', 'unit'],
		}, {
			model: Loyalty,
			as: 'Target',
			required: true,
			where: whereTarget,
			attributes: ['id', 'name', 'unit'],
		}],
		page: params.page,
		paginate: params.item,
		where: whereCondition,
	};

	const conversion = await ConvertionRate.paginate({ ...dataOptions });
	if (conversion) {
		return new ResponsePaginate(20042, {
			item: params.item,
			pages: params.page,
			total: conversion.total,
		}, conversion.docs);
	}

	throw new ErrorResponse(41701);
};

exports.getKeyboardFieldConversion = async (request) => {
	const { user } = request;
	const whereCondition = {};
	// const whereSource = {};
	const whereTarget = {};
	const allowedTo = [];
	const allowedFrom = [];

	const params = JSON.parse(JSON.stringify(request.query));

	if (params.loyalty_id != null) {
		const conversionRule = await Conversion.findOne({ where: { loyalty_id: params.loyalty_id } });
		const conversionData = JSON.parse(conversionRule.data_conversion);

		if (Object.prototype.hasOwnProperty.call(conversionData, 'loyalty_from') && conversionData.loyalty_from != null) {
			conversionData.loyalty_from.forEach((id) => {
				allowedFrom.push(id);
			});
		}
		if (Object.prototype.hasOwnProperty.call(conversionData, 'loyalty_to') && conversionData.loyalty_to != null) {
			conversionData.loyalty_to.forEach((id) => {
				allowedTo.push(id);
			});
		}
		if (params.conversion_type === 'from') {
			whereCondition.loyalty_id = params.loyalty_id;
			if (params.search != null && typeof (params.search) === 'string') {
				whereTarget.name = {
					[Op.like]: `%${params.search}%`,
				};
			}
		} else {
			// whereCondition.conversion_loyalty = params.loyalty_id;
			// if (params.search != null && typeof (params.search) === 'string') {
			// 	whereSource.name = {
			// 		[Op.like]: `%${params.search}%`,
			// 	};
			// }
		}
	}

	if (allowedFrom.length !== 0) {
		whereCondition[Op.and] = {
			loyalty_id: {
				[Op.in]: allowedFrom,
			},
		};
	}
	if (allowedTo.length !== 0) {
		whereCondition[Op.and] = {
			conversion_loyalty: {
				[Op.in]: allowedTo,
			},
		};
	}

	const rate = await ConvertionRate.findOne({
		where: {
			loyalty_id: params.loyalty_id_source,
			conversion_loyalty: params.loyalty_id_target,
			...whereCondition,
		},
		attributes: ['minimum', 'multiple', 'point_conversion', 'point_loyalty'],
	});

	if (rate) {
		const res = {
			point_source: 0,
			unit_source: 'point',
			point_target: 0,
			unit_target: 'point',
			max: 0,
			minimum_target: 0,
			minimum: rate.minimum,
			multiple: rate.multiple,
		};

		const rateWithFee = (rate.point_conversion / rate.point_loyalty);

		res.minimum_target = rateWithFee * rate.minimum;

		let memberCardSource = await LoyaltyMemberCards.findOne({
			where: {
				loyalty_id: params.loyalty_id_source,
			},
			include: [
				{
					model: MemberCards,
					where: {
						members_id: user.id,
					},
					attributes: ['id', 'point_balance'],
				}, {
					model: Loyalty,
					attributes: ['id', 'unit'],
				},
			],
		});

		if (!memberCardSource) {
			return new ErrorResponse(41724);
		}

		memberCardSource = memberCardSource.toJSON();

		if (memberCardSource) {
			if (memberCardSource.loyalties.length > 0) {
				res.unit_source = memberCardSource.loyalties[0].unit;
			}

			if (memberCardSource.member_cards.length > 0) {
				res.point_source = memberCardSource.member_cards[0].point_balance;

				for (let i = rate.multiple; i <= res.point_source; i += rate.multiple) {
					res.max = i;
				}
			}
		}

		let memberCardTarget = await LoyaltyMemberCards.findOne({
			where: {
				loyalty_id: params.loyalty_id_target,
			},
			include: [
				{
					model: MemberCards,
					where: {
						members_id: user.id,
					},
					attributes: ['id', 'point_balance'],
				}, {
					model: Loyalty,
					attributes: ['id', 'unit'],
				},
			],
		});

		if (!memberCardTarget) {
			return new ErrorResponse(41725);
		}

		memberCardTarget = memberCardTarget.toJSON();

		if (memberCardTarget) {
			if (memberCardTarget.loyalties.length > 0) {
				res.unit_target = memberCardTarget.loyalties[0].unit;
			}

			if (memberCardTarget.member_cards.length > 0) {
				res.point_target = memberCardTarget.member_cards[0].point_balance;
			}
		}

		return new Response(20054, res);
	}
	// Error: Convertion rate not found
	throw new ErrorResponse(41701);
};

exports.getConversionSource = async (request) => {
	const { user, query } = request;

	query.page = parseInt(query.page, 10) || 1;
	query.item = parseInt(query.item, 10) || 10;

	const where = {};

	const rule = await Conversion.findAll({
		where: {
			role: {
				[Op.or]: ['as_source_only', 'as_source_destination'],
			},
		},
		group: [
			'loyalty_id',
		],
		attributes: ['loyalty_id'],
	});

	const loyaltyId = rule.map(value => value.loyalty_id);

	where.loyalty_id = {
		[Op.in]: loyaltyId,
	};

	const whereLoyalty = {};

	if (Object.prototype.hasOwnProperty.call(query, 'search')) {
		whereLoyalty.name = {
			[Op.like]: `%${query.search}%`,
		};
	}

	const loyaltyMemberCards = await LoyaltyMemberCards.paginate({
		where,
		page: query.page,
		paginate: query.item,
		include: [
			{
				model: MemberCards,
				where: {
					members_id: user.id,
				},
			}, {
				model: Loyalty,
				where: whereLoyalty,
				attributes: {
					exclude: [
						'api_user_detail',
						'api_user_point',
						'api_point_plus',
						'api_point_minus',
						'api_refresh_token',
						'auth_field',
						'confirm_field',
					],
				},
			},
		],
	});

	return new ResponsePaginate(20055, {
		item: query.item,
		pages: query.page,
		total: loyaltyMemberCards.total,
	}, loyaltyMemberCards.docs);
};

exports.getConversionDestination = async (request) => {
	const { user } = request;
	const whereCondition = {};
	const allowedTo = [];
	const loyaltyId = [];

	const params = JSON.parse(JSON.stringify(request.query));

	const loyaltyExists = await Loyalty.findOne({
		where: {
			id: params.loyalty_id,
		},
	});

	if (loyaltyExists === null) {
		return new ErrorResponse(41709);
	}


	params.page = parseInt(params.page, 10) || 1;
	params.item = parseInt(params.item, 10) || 10;


	if (params.loyalty_id != null) {
		const conversionRule = await Conversion.findOne({ where: { loyalty_id: params.loyalty_id } });
		const conversionData = JSON.parse(conversionRule.data_conversion);

		if (conversionData.loyalty_to != null) {
			conversionData.loyalty_to.forEach((id) => {
				allowedTo.push(id);
			});
		}
		whereCondition.loyalty_id = params.loyalty_id;
		// if (params.search != null && typeof (params.search) === 'string') {
		// 	whereTarget.name = {
		// 		[Op.like]: `%${params.search}%`,
		// 	};
		// }
	}

	if (allowedTo.length !== 0) {
		whereCondition[Op.and] = {
			conversion_loyalty: {
				[Op.in]: allowedTo,
			},
		};
	}

	const dataOptions = {
		attributes: ['conversion_loyalty'],
		where: whereCondition,
		raw: true,
	};

	const conversion = await ConvertionRate.findAll({ ...dataOptions });
	if (conversion.length !== 0) {
		conversion.forEach((id) => {
			loyaltyId.push(id.conversion_loyalty);
		});
	}
	// const loyalty = await Loyalty.paginate({
	// 	page: params.page,
	// 	paginate: params.item,
	// 	where: { id: { [Op.in]: loyaltyId } },
	// });

	const loyaltyMemberCards = await LoyaltyMemberCards.paginate({
		where: {
			loyalty_id: {
				[Op.in]: loyaltyId,
			},
		},
		page: params.page,
		paginate: params.item,
		include: [
			{
				model: MemberCards,
				where: {
					members_id: user.id,
				},
			}, {
				model: Loyalty,
				attributes: {
					exclude: [
						'api_user_detail',
						'api_user_point',
						'api_point_plus',
						'api_point_minus',
						'api_refresh_token',
						'auth_field',
						'confirm_field',
					],
				},
			},
		],
	});

	if (loyaltyMemberCards) {
		return new ResponsePaginate(20043, {
			item: params.item,
			pages: params.page,
			total: loyaltyMemberCards.total,
		}, loyaltyMemberCards.docs);
	}

	throw new ErrorResponse(41701);
};
