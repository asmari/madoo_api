const sequelize = require('sequelize');
const moment = require('moment');
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
const MasterUnit = model.MasterUnit.Get;
const ConversionRule = model.ConversionRule.Get;

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
			attributes: ['id', 'name', 'unit', 'type_loyalty_id', 'business_partner_id', 'unit_id'],
		}, {
			model: Loyalty,
			as: 'Target',
			required: true,
			attributes: ['id', 'name', 'unit', 'type_loyalty_id', 'business_partner_id', 'unit_id'],
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
		include: [
			{
				model: MasterUnit,
			},
		],
		attributes: ['id', 'name', 'unit', 'type_loyalty_id', 'business_partner_id', 'unit_id'],
	});

	if (!loyaltySource) {
		throw new ErrorResponse(41722);
	}

	const loyaltyTarget = await Loyalty.findOne({
		where: {
			id: params.loyalty_id_target,
		},
		include: [
			{
				model: MasterUnit,
			},
		],
		attributes: ['id', 'name', 'unit', 'type_loyalty_id', 'business_partner_id', 'unit_id'],
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
			attributes: ['id', 'name', 'unit', 'type_loyalty_id', 'business_partner_id', 'unit_id'],
		}, {
			model: Loyalty,
			as: 'Target',
			required: true,
			attributes: ['id', 'name', 'unit', 'type_loyalty_id', 'business_partner_id', 'unit_id'],
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

		// logic 1
		// const rateWithFee = (rate.point_conversion / rate.point_loyalty);
		// const rateWithoutFee = (rate.mid_from_rate / rate.mid_to_rate);
		// const pointWithFee = rateWithFee * params.point_to_convert;
		// const pointWoFee = rateWithoutFee * params.point_to_convert;
		// const fee = pointWoFee - pointWithFee;

		// const amountWithFee = (pointWithFee * rate.mid_to_rate);
		// const amountWoFee = (pointWoFee * rate.mid_to_rate);
		// const feeIdr = amountWoFee - amountWithFee;

		// logic 2
		const MIDamount = params.point_to_convert * rate.mid_from_rate;
		const fee = parseInt(MIDamount, 10) * rate.percentage_fee;
		const pointPercent = MIDamount * rate.percentage_fee;
		const pointAmount = (MIDamount - pointPercent);
		const pointConvert = (pointAmount / rate.mid_to_rate);
		const feeIdr = MIDamount * rate.percentage_fee;

		const cardSource = memberCardSource.member_cards[0];
		const cardTarget = memberCardTarget.member_cards[0];

		const sourceRequest = new LoyaltyRequest();
		await sourceRequest.setLoyaltyId(loyaltySource.id);
		sourceRequest.setMemberCardId(cardSource.id);

		const sourceNewPoint = await sourceRequest.getMemberPoint();

		Logger.info('SOURCE POINT REFRESH', sourceNewPoint);

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

			Logger.info('UPDATE SOURCE POINT', cardSource.toJSON(), sourcePoint);
		}

		const targetRequest = new LoyaltyRequest();
		await targetRequest.setLoyaltyId(loyaltyTarget.id);
		targetRequest.setMemberCardId(cardTarget.id);

		const targetNewPoint = await targetRequest.getMemberPoint();

		Logger.info('TARGET POINT REFRESH', targetNewPoint);

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

		const now = moment();

		const totalTrxToday = await Transaction.count({
			where: {
				created_at: {
					[Op.gte]: now.format('YYYY-MM-01 00:00:00'),
					[Op.lte]: now.format('YYYY-MM-31 HH:mm:SS'),
				},
			},
		});

		let trxId = null;

		const totalTrxNumber = totalTrxToday === 0 ? 1 : totalTrxToday;

		const str = totalTrxNumber.toString();

		const orderNo = `${now.format('YYMM')}${'0'.repeat(6 - str.length)}${str}`;

		const transaction = await Transaction.create({
			unix_id: orderNo,
			member_cards_id: cardSource.id,
			conversion_member_cards_id: cardTarget.id,
			point: params.point_to_convert,
			conversion_point: pointConvert,
			// conversion_point: pointConvert,
			point_balance: cardSource.point_balance,
			point_balance_after: (cardSource.point_balance - params.point_to_convert),
			conversion_point_balance: cardTarget.point_balance,
			conversion_point_balance_after: (cardTarget.point_balance + pointConvert),
			// conversion_point_balance_after: (cardTarget.point_balance + pointConvert),
			status: 'pending',
			fee,
			feeidr: feeIdr,
			mid_rate_from: rate.mid_from_rate,
			mid_rate_to: rate.mid_to_rate,
		});

		const responseDone = new Promise(async (resolve, reject) => {
			const successResponse = {
				deduct: false,
				add: false,
			};

			try {
				Logger.info('Start Convertion', transaction.toJSON());

				const resMinusPoint = await sourceRequest.pointMinus({
					point: params.point_to_convert,
				}, transaction.toJSON());

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

						if (val.keyName === 'trx_id') {
							trxId = val.value;
						}
					});

					if (Number.isNaN(pointMinus) || pointMinus == null) {
						pointMinus = 0;
					}

					await cardSource.update({
						point_balance: pointMinus,
					});
				}

				const resAddPoint = await targetRequest.pointAdd({
					point: pointConvert,
					// point: pointConvert,
				}, transaction.toJSON());

				Logger.info('Response Add', resAddPoint);

				successResponse.add = resAddPoint.status;

				await TransactionLog.create({
					unix_id: transaction.unix_id,
					type_trx: 'point_add',
					status: resAddPoint.status ? 1 : 0,
					member_cards_id: cardTarget.id,
					point_balance: pointConvert,
					// point_balance: pointConvert,
					response_third_party: JSON.stringify(resAddPoint),
				});

				if (resAddPoint.status) {
					let pointAdd = cardSource.point_balance;

					if (Number.isNaN(pointAdd) || pointAdd == null) {
						pointAdd = 0;
					}

					resAddPoint.data.forEach((val) => {
						if (val.keyName === 'point_balance') {
							pointAdd = val.value;
						}

						if (val.keyName === 'trx_id') {
							trxId = val.value;
						}
					});

					await cardTarget.update({
						point_balance: pointAdd,
					});
				}

				const newLogic = loyaltyTarget.api_point_plus;

				if (successResponse.add && successResponse.deduct) {
					if (Object.prototype.hasOwnProperty.call(resAddPoint, 'pendingOnly') || Object.prototype.hasOwnProperty.call(resMinusPoint, 'pendingOnly')) {
						await transaction.update({
							status: 'pending',
							trxid: trxId,
						});
					} else {
						await transaction.update({
							trxid: trxId,
							status: 'success',
						});
					}

					const member = await Member.findOne({
						where: {
							id: user.id,
						},
					});

					const date = new Date(transaction.created_at);

					if (member && newLogic.search('new-logic:')) {
						const emailSender = new EmailSender();
						await emailSender.sendConversion(member.email, {
							name: member.full_name,
							date: `${date.getDate()} ${date.getMonth() + 1} ${date.getFullYear()}`,
							conversionId: transaction.unix_id,
							loyaltySource: loyaltySource.name,
							pointSource: params.point_to_convert,
							unitSource: loyaltySource.master_unit.unit,
							loyaltyTarget: loyaltyTarget.name,
							pointTarget: pointConvert,
							// pointTarget: pointConvert,
							unitTarget: loyaltyTarget.master_unit.unit,
							currentPointSource: transaction.point_balance_after,
							currentPointTarget: transaction.conversion_point_balance_after,
						});
					}
				} else {
					await transaction.update({
						trxid: trxId,
						status: 'failed',
					});
				}

				const options = {
					message: '',
					title: '',
				};

				switch (transaction.status) {
				case 'success':
					options.message = `You've successfully converted ${transaction.point} ${loyaltySource.name} ${loyaltySource.master_unit.title} to ${transaction.conversion_point} ${loyaltyTarget.name} ${loyaltyTarget.master_unit.title}`;
					options.title = 'Your point conversion is now complete!';
					break;

				case 'failed':
					options.message = `Your Point Conversion From ${loyaltySource.name} to ${loyaltyTarget.name} is failed, but keep calm & try again`;
					options.title = 'Oh no, your point conversion is failed';
					break;

				default:
					options.title = 'Conversion in progress';
					options.message = 'Please wait, your conversion in progress';
					break;
				}

				if (transaction.status !== 'pending' && newLogic.search('new-logic:')) {
					const notification = await Notification.create({
						loyalty_id: loyaltySource.id,
						type: 'conversion',
						transaction_id: transaction.id,
						promo_id: 0,
						title: options.title,
						valid_until: new Date(),
						description: options.message,
						recipient_type: 'member',
						status: 'FINISH',
						click: 'notif',
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
									promo_id: notification.promo_id,
									transaction_id: notification.transaction_id,
								}),
								image: notification.image || null,
							},
							priority: 'normal',
							notification: {
								title: notification.title,
								body: notification.description,
								click_action: notification.click,
							},
						});
					}
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
	let data = [];
	let convert = {};

	const params = JSON.parse(JSON.stringify(request.query));

	params.page = parseInt(params.page, 10) || 1;
	params.item = parseInt(params.item, 10) || 10;


	if (params.loyalty_id != null) {
		const conversionRule = await Conversion.findOne({ where: { loyalty_id: params.loyalty_id } });

		if (conversionRule) {
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
	}

	if (allowedFrom.length > 0 || allowedTo.length > 0) {
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
				attributes: ['id', 'name', 'unit', 'type_loyalty_id', 'business_partner_id', 'unit_id'],
			}, {
				model: Loyalty,
				as: 'Target',
				required: true,
				where: whereTarget,
				attributes: ['id', 'name', 'unit', 'type_loyalty_id', 'business_partner_id', 'unit_id'],
			}],
			page: params.page,
			paginate: params.item,
			where: whereCondition,
		};

		convert = await ConvertionRate.paginate({ ...dataOptions });
		data = convert.docs;
	}

	return new ResponsePaginate(20042, {
		item: params.item,
		pages: params.page,
		total: convert.total || 0,
	}, data);
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
					attributes: ['id', 'unit', 'type_loyalty_id', 'business_partner_id', 'unit_id'],
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
					attributes: ['id', 'unit', 'type_loyalty_id', 'business_partner_id', 'unit_id'],
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

// exports.getConversionSource = async (request) => {
// 	const { user, query } = request;

// 	query.page = parseInt(query.page, 10) || 1;
// 	query.item = parseInt(query.item, 10) || 10;

// 	const where = {};

// 	const rule = await Conversion.findAll({
// 		where: {
// 			role: {
// 				[Op.or]: ['as_source_only', 'as_source_destination'],
// 			},
// 		},
// 		group: [
// 			'loyalty_id',
// 		],
// 		attributes: ['loyalty_id'],
// 	});


// 	const loyaltyId = rule.map(value => value.loyalty_id);

// 	Logger.log('SOURCE', loyaltyId);

// 	where.loyalty_id = {
// 		[Op.in]: loyaltyId,
// 	};

// 	const whereLoyalty = {
// 		enable_trx: 1,
// 	};

// 	if (Object.prototype.hasOwnProperty.call(query, 'search')) {
// 		whereLoyalty.name = {
// 			[Op.like]: `%${query.search}%`,
// 		};
// 	}

// 	const loyaltyMemberCards = await LoyaltyMemberCards.paginate({
// 		where,
// 		page: query.page,
// 		paginate: query.item,
// 		include: [
// 			{
// 				model: MemberCards,
// 				where: {
// 					members_id: user.id,
// 				},
// 			}, {
// 				model: Loyalty,
// 				where: whereLoyalty,
// 				attributes: {
// 					exclude: [
// 						'api_user_detail',
// 						'api_user_point',
// 						'api_point_plus',
// 						'api_point_minus',
// 						'api_refresh_token',
// 						'auth_field',
// 						'confirm_field',
// 					],
// 				},
// 			},
// 		],
// 	});

// 	Logger.log('SOURCE', loyaltyMemberCards);

// 	return new ResponsePaginate(20055, {
// 		item: query.item,
// 		pages: query.page,
// 		total: loyaltyMemberCards.total,
// 	}, loyaltyMemberCards.docs);
// };

exports.getConversionSource = async (request) => {
	const { user, query } = request;

	query.page = parseInt(query.page, 10) || 1;
	query.item = parseInt(query.item, 10) || 10;

	const whereSearch = {
		enable_trx: 1,
	};

	if (Object.prototype.hasOwnProperty.call(query, 'search')) {
		whereSearch.name = {
			[Op.like]: `%${query.search}%`,
		};
	}

	const cards = await LoyaltyMemberCards.paginate({
		include: [
			{
				model: Loyalty,
				required: true,
				where: {
					[Op.or]: [
						{
							role: 'source_destination',
						}, {
							role: 'source',
						},
					],
					...whereSearch,
				},
				include: [
					{
						model: ConvertionRate,
						as: 'LoyaltySource',
						required: true,
						where: {
							enable_trx: 1,
						},
					},
				],
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
			}, {
				model: MemberCards,
				where: {
					members_id: user.id,
				},
			},
		],
	});

	return new ResponsePaginate(20055, {
		item: query.item,
		pages: query.page,
		total: cards.total,
	}, cards.docs);
};

exports.getConversionDestination = async (request) => {
	const { user, query } = request;

	query.page = parseInt(query.page, 10) || 1;
	query.item = parseInt(query.item, 10) || 10;

	const loyaltyExists = await Loyalty.findOne({
		where: {
			id: query.loyalty_id,
		},
	});

	if (loyaltyExists === null) {
		return new ErrorResponse(41709);
	}

	if (loyaltyExists.role === 'destination') {
		return new ErrorResponse(41730);
	}

	const whereSearch = {
		enable_trx: 1,
	};

	if (Object.prototype.hasOwnProperty.call(query, 'search')) {
		whereSearch.name = {
			[Op.like]: `%${query.search}%`,
		};
	}

	const rules = await ConversionRule.findAll({
		where: {
			loyalty_from: loyaltyExists.id,
		},
	});

	const cards = await LoyaltyMemberCards.paginate({
		page: query.page,
		paginate: query.item,
		include: [
			{
				model: Loyalty,
				required: true,
				include: [
					{
						model: ConvertionRate,
						as: 'LoyaltyTarget',
						required: true,
						where: {
							loyalty_id: query.loyalty_id,
							enable_trx: 1,
						},
					},
				],
				where: {
					[Op.and]: {
						[Op.or]: [
							{
								role: 'source_destination',
							}, {
								role: 'destination',
							},
						],
						id: {
							[Op.in]: rules.map(x => x.loyalty_to),
						},
					},
					...whereSearch,
				},
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
			}, {
				model: MemberCards,
				where: {
					members_id: user.id,
				},
			},
		],
	});

	if (cards) {
		return new ResponsePaginate(20043, {
			item: query.item,
			pages: query.page,
			total: cards.total,
		}, cards.docs);
	}

	throw new ErrorResponse(41701);
};

// exports.getConversionDestination = async (request) => {
// 	const { user } = request;
// 	const whereCondition = {};
// 	const whereTarget = {
// 		enable_trx: 1,
// 	};
// 	const allowedTo = [];
// 	let loyaltyId = [];
// 	const loyaltyIdTrx = [];

// 	const params = JSON.parse(JSON.stringify(request.query));

// 	const loyaltyExists = await Loyalty.findOne({
// 		where: {
// 			id: params.loyalty_id,
// 		},
// 	});

// 	if (loyaltyExists === null) {
// 		return new ErrorResponse(41709);
// 	}

// 	Logger.info('START DESTINATION');

// 	Logger.trace(JSON.stringify(loyaltyExists));

// 	const rate = await ConvertionRate.findAll({
// 		where: {
// 			loyalty_id: loyaltyExists.id,
// 			enable_trx: 1,
// 		},
// 		attributes: ['conversion_loyalty'],
// 	});


// 	Logger.trace(JSON.stringify(rate));

// 	if (rate) {
// 		rate.forEach((val) => {
// 			loyaltyIdTrx.push(val.conversion_loyalty);
// 		});
// 	}

// 	params.page = parseInt(params.page, 10) || 1;
// 	params.item = parseInt(params.item, 10) || 10;


// 	if (params.loyalty_id != null) {
// 		const conversionRule = await Conversion.findOne({ where: { loyalty_id: params.loyalty_id } });
// 		const conversionData = JSON.parse(conversionRule.data_conversion);

// 		if (conversionData.loyalty_to != null) {
// 			conversionData.loyalty_to.forEach((id) => {
// 				allowedTo.push(id);
// 			});
// 		}
// 		whereCondition.loyalty_id = params.loyalty_id;
// 		if (params.search != null && typeof (params.search) === 'string') {
// 			whereTarget.name = {
// 				[Op.like]: `%${params.search}%`,
// 			};
// 		}
// 	}

// 	if (allowedTo.length !== 0) {
// 		whereCondition[Op.and] = {
// 			conversion_loyalty: {
// 				[Op.in]: allowedTo,
// 			},
// 		};
// 	}

// 	Logger.trace(JSON.stringify(whereCondition));
// 	const dataOptions = {
// 		attributes: ['conversion_loyalty'],
// 		where: whereCondition,
// 		raw: true,
// 	};

// 	const conversion = await ConvertionRate.findAll({ ...dataOptions });
// 	if (conversion.length !== 0) {
// 		conversion.forEach((id) => {
// 			loyaltyId.push(id.conversion_loyalty);
// 		});
// 	}

// 	loyaltyId = loyaltyId.concat(loyaltyIdTrx.filter(e => loyaltyId.indexOf(e) < 0));
// 	// const loyalty = await Loyalty.paginate({
// 	// 	page: params.page,
// 	// 	paginate: params.item,
// 	// 	where: { id: { [Op.in]: loyaltyId } },
// 	// });

// 	Logger.trace(JSON.stringify(loyaltyIdTrx));

// 	const loyaltyMemberCards = await LoyaltyMemberCards.paginate({
// 		where: {
// 			loyalty_id: {
// 				[Op.in]: loyaltyIdTrx,
// 			},
// 		},
// 		page: params.page,
// 		paginate: params.item,
// 		include: [
// 			{
// 				model: MemberCards,
// 				where: {
// 					members_id: user.id,
// 				},
// 			}, {
// 				model: Loyalty,
// 				where: whereTarget,
// 				attributes: {
// 					exclude: [
// 						'api_user_detail',
// 						'api_user_point',
// 						'api_point_plus',
// 						'api_point_minus',
// 						'api_refresh_token',
// 						'auth_field',
// 						'confirm_field',
// 					],
// 				},
// 			},
// 		],
// 	});

// 	if (loyaltyMemberCards) {
// 		return new ResponsePaginate(20043, {
// 			item: params.item,
// 			pages: params.page,
// 			total: loyaltyMemberCards.total,
// 		}, loyaltyMemberCards.docs);
// 	}

// 	throw new ErrorResponse(41701);
// };
