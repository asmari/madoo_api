const model = require('../../models/index');
const { Response, ErrorResponse } = require('../../helper/response');
const Request = require('../../restclient/request');
const FcmSender = require('../../helper/FcmSender');
const EmailSender = require('../../helper/EmailSender');

const config = require('../../config').get;

const OtpMembers = model.Otp.Get;
const ForgotPassword = model.ForgotPassword.Get;
const MemberRegisters = model.MembersRegister;
const Members = model.Members.Get;

const Transaction = model.Transaction.Get;
const Notification = model.Notification.Get;
const MemberCards = model.MembersCards.Get;
const Loyalty = model.Loyalty.Get;
const NotificationMember = model.NotificationMembers.Get;
const LoyaltyHasMemberCards = model.LoyaltyMemberCards.Get;
const NotificationSettings = model.NotificationSettings.Get;
// const TransactionLog = model.TransactionLog.Get;

// const Logger = require('../../helper/Logger').Webhook;

exports.doSaveOtpHook = async (request) => {
	const { body } = request;

	if (Object.prototype.hasOwnProperty.call(body, 'status') && Object.prototype.hasOwnProperty.call(body, 'statusCode') && Object.prototype.hasOwnProperty.call(body, 'clientMessageId')) {
		const {
			clientMessageId,
			status,
			statusCode,
			destination,
		} = body;

		const splitId = clientMessageId.split('_');

		switch (splitId[1]) {
		case 'otp':
			// eslint-disable-next-line no-case-declarations
			const memberRegister = await MemberRegisters.findOne({
				where: {
					mobile_phone: destination,
				},
			});

			// eslint-disable-next-line no-case-declarations
			const otpMembers = await OtpMembers.findOne({
				where: {
					otp: splitId[0],
					members_register_id: memberRegister.id,
				},
			});

			if (otpMembers) {
				otpMembers.update({
					webhook_status: `{'status':'${status}','statusCode':'${statusCode}'}`,
				});
			}

			break;

		case 'forgot':
			// eslint-disable-next-line no-case-declarations
			const members = await Members.findOne({
				where: {
					mobile_phone: destination,
				},
			});

			// eslint-disable-next-line no-case-declarations
			const forgotPassword = await ForgotPassword.findOne({
				where: {
					otp: splitId[0],
					members_id: members.id,
				},
			});

			if (forgotPassword) {
				forgotPassword.update({
					webhook_status: `{'status':'${status}','statusCode':'${statusCode}'}`,
				});
			}

			break;

		default:

			break;
		}
	}

	return body;
};

exports.doGopayIris = async (request) => {
	const { body } = request;

	const trx = await Transaction.findOne({
		where: {
			trxid: body.reference_no,
		},
	});

	if (trx) {
		const url = `${config.iris.url}/payouts/${body.reference_no}`;
		const rand = Math.floor((Math.random() * (999999 - 100000)) + 100000);
		const req = new Request();
		req.createHeaders({
			Authorization: `Basic ${config.iris.payouts}`, // SVJJUy03MDg2YmIyOC1mMzgxLTQ1NjQtYTEzOS0wNzMyMzNhMzJjOWI6',
			'Content-Type': 'application/json',
			'X-Idempotency-Key': `${trx.unix_id}_${rand}`,
			Accept: 'application/json',
		});

		const res = await req.request(url, 'GET', '', 'utf-8');

		if (!Object.prototype.hasOwnProperty.call(res, 'errors')) {
			let status = 'pending';

			if (res.status === 'completed') {
				status = 'success';
			} else if (res.status === 'failed') {
				status = 'failed';
			}

			trx.update({
				status,
				trxstatus: JSON.stringify(res),
			});
		} else {
			trx.update({
				status: 'failed',
				trxstatus: JSON.stringify(res),
			});
		}

		Loyalty.hasMany(LoyaltyHasMemberCards, {
			foreignKey: 'loyalty_id',
		});

		const loyaltySource = await Loyalty.findOne({
			include: [
				{
					model: LoyaltyHasMemberCards,
					required: true,
					paranoid: false,
					where: {
						member_cards_id: trx.member_cards_id,
					},
				},
			],
		});

		const loyaltyTarget = await Loyalty.findOne({
			include: [
				{
					model: LoyaltyHasMemberCards,
					required: true,
					paranoid: false,
					where: {
						member_cards_id: trx.conversion_member_cards_id,
					},
				},
			],
		});

		const card = await MemberCards.findOne({
			paranoid: false,
			where: {
				id: trx.member_cards_id,
			},
		});

		const member = await Members.findOne({
			paranoid: false,
			where: {
				id: card.members_id,
			},
		});

		const options = {
			message: '',
			title: '',
		};

		switch (trx.status) {
		case 'success':
			options.message = `You've successfully converted ${trx.point} ${loyaltySource.name} ${loyaltySource.master_unit.title} to ${trx.conversion_point} ${loyaltyTarget.name} ${loyaltyTarget.master_unit.title}`;
			options.title = 'Your point conversion is now complete!';

			// eslint-disable-next-line no-case-declarations
			const date = new Date(trx.created_at);

			// eslint-disable-next-line no-case-declarations
			const emailSender = new EmailSender();
			await emailSender.sendConversion(member.email, {
				name: member.full_name,
				date: `${date.getDate()} ${date.getMonth() + 1} ${date.getFullYear()}`,
				conversionId: trx.unix_id,
				loyaltySource: loyaltySource.name,
				pointSource: trx.point,
				unitSource: loyaltySource.master_unit.unit,
				loyaltyTarget: loyaltyTarget.name,
				pointTarget: trx.conversion_point,
				unitTarget: loyaltyTarget.master_unit.unit,
				currentPointSource: trx.point_balance_after,
				currentPointTarget: trx.conversion_point_balance_after,
			}, member.full_name);
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

		if (trx.status !== 'pending') {
			let notification = await Notification.findOne({
				where: {
					transaction_id: trx.id,
					loyalty_id: loyaltySource.id,
				},
			});

			if (notification == null) {
				notification = await Notification.create({
					loyalty_id: loyaltySource.id,
					type: 'conversion',
					transaction_id: trx.id,
					promo_id: 0,
					title: options.title,
					valid_until: new Date(),
					description: options.message,
					recipient_type: 'member',
					status: 'FINISH',
					click: 'notif',
				});
			}

			if (notification) {
				await notification.update({
					loyalty_id: loyaltySource.id,
					type: 'conversion',
					transaction_id: trx.id,
					promo_id: 0,
					title: options.title,
					valid_until: new Date(),
					description: options.message,
					recipient_type: 'member',
					status: 'FINISH',
					click: 'notif',
				});

				const notificationMember = await NotificationMember.findOne({
					where: {
						notification_id: notification.id,
						members_id: card.members_id,
					},
				});

				if (notificationMember == null) {
					await NotificationMember.create({
						members_id: card.members_id,
						notification_id: notification.id,
						read: 0,
					});
				}

				const settings = await NotificationSettings.findOne({
					where: {
						members_id: card.members_id,
					},
				});

				if (settings && settings.conversion === 1) {
					await FcmSender.sendToUser(card.members_id, {
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
		}

		return new Response(20061, res);
	}

	return new ErrorResponse(41727);
};
