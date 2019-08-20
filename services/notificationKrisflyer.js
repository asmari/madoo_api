const {
	workerData,
// eslint-disable-next-line import/no-unresolved
} = require('worker_threads');

const moment = require('moment');

const model = require('../models/index');
const FcmSender = require('../helper/FcmSender');
const EmailSender = require('../helper/EmailSender');
const logger = require('../helper/Logger').Notifications;

const { KrisflyerBatchDetail } = model;
const MemberCards = model.MembersCards.Get;
const Members = model.Members.Get;
const DeviceNotification = model.DeviceNotification.Get;
const LoyaltyMemberCards = model.LoyaltyMemberCards.Get;
const Loyalty = model.Loyalty.Get;
const Transaction = model.Transaction.Get;
const Notification = model.Notification.Get;
const NotificationMember = model.NotificationMembers.Get;

const data = workerData;

const run = async () => {
	MemberCards.hasOne(LoyaltyMemberCards, {
		foreignKey: 'member_cards_id',
		as: 'loyalty_card',
	});

	logger.info('============================== START KRISFLYER NOTIFICATION ==================================');
	const details = await KrisflyerBatchDetail.findAll({
		where: {
			krisflayer_batch_upload_id: data.id,
		},
		raw: true,
		include: [
			{
				model: Transaction,
				as: 'transaction',
				paranoid: false,
				required: true,
				attributes: ['id', 'status', 'point', 'conversion_point', 'unix_id', 'created_at', 'point_balance_after', 'conversion_point_balance_after'],
				include: [
					{
						model: MemberCards,
						as: 'source_member_cards',
						paranoid: false,
						required: true,
						attributes: ['id'],
						include: [
							{
								model: LoyaltyMemberCards,
								paranoid: false,
								as: 'loyalty_card',
								required: true,
								attributes: ['id'],
								include: [
									{
										required: true,
										model: Loyalty,
										paranoid: false,
										attributes: ['id', 'name'],
									},
								],
							},
						],
					},
					{
						model: MemberCards,
						paranoid: false,
						required: true,
						as: 'target_member_cards',
						attributes: ['id'],
						include: [
							{
								paranoid: false,
								model: LoyaltyMemberCards,
								required: true,
								as: 'loyalty_card',
								attributes: ['id'],
								include: [
									{
										paranoid: false,
										required: true,
										model: Loyalty,
										attributes: ['id', 'name'],
									},
								],
							},
						],
					},
				],
			},
			{
				paranoid: false,
				model: MemberCards,
				as: 'member_card',
				required: true,
				attributes: ['id'],
				include: [
					{
						model: LoyaltyMemberCards,
						as: 'loyalty_card',
						paranoid: false,
						required: true,
						attributes: ['id'],
						include: [
							{
								model: Loyalty,
								required: true,
								attributes: ['id'],
							},
						],
					},
					{
						model: Members,
						as: 'member',
						paranoid: false,
						required: true,
						attributes: ['id', 'email', 'full_name'],
						include: [
							{
								model: DeviceNotification,
								attributes: ['fcm_token'],
								required: true,
							},
						],
					},
				],
			},
		],
	});

	if (details != null && details.length > 0) {
		details.forEach(async (detail) => {
			if (detail['transaction.status'] === 'pending') {
				return;
			}

			// console.log(detail);
			// return;
			const options = {
				message: '',
				title: '',
			};

			if (detail['transaction.status'] === 'success') {
				const emailSender = new EmailSender();
				const date = moment(detail['transaction.created_at']);
				await emailSender.sendConversion(detail['member_card.member.email'], {
					name: detail['member_card.member.full_name'],
					date: date.format('DD MM YYYY'),
					conversionId: detail['transaction.unix_id'],
					loyaltySource: detail['transaction.source_member_cards.loyalty_card.loyalties.name'],
					pointSource: detail['transaction.point'],
					unitSource: detail['transaction.source_member_cards.loyalty_card.loyalties.master_unit.unit'],
					loyaltyTarget: detail['transaction.target_member_cards.loyalty_card.loyalties.name'],
					pointTarget: detail['transaction.conversion_point'],
					// pointTarget: pointConvert,
					unitTarget: detail['transaction.target_member_cards.loyalty_card.loyalties.master_unit.unit'],
					currentPointSource: detail['transaction.point_balance_after'],
					currentPointTarget: detail['transaction.point_balance_after'],
				});
			}

			switch (detail['transaction.status']) {
			case 'success':
				options.message = `You've successfully converted ${detail['transaction.point']} ${detail['transaction.source_member_cards.loyalty_card.loyalties.name']} ${detail['transaction.source_member_cards.loyalty_card.loyalties.master_unit.title']} to ${detail['transaction.conversion_point']} ${detail['transaction.target_member_cards.loyalty_card.loyalties.type_loyalties.title']} ${detail['transaction.target_member_cards.loyalty_card.loyalties.master_unit.title']}`;
				options.title = 'Your point conversion is now complete!';
				break;

			case 'failed':
				options.message = `Your Point Conversion From ${detail['transaction.source_member_cards.loyalty_card.loyalties.business_partners.name']} to ${detail['transaction.target_member_cards.loyalty_card.loyalties.business_partners.name']} is failed, but keep calm & try again`;
				options.title = 'Oh no, your point conversion is failed';
				break;

			default:
				options.title = 'Conversion in progress';
				options.message = 'Please wait, your conversion in progress';
				break;
			}

			if (detail['transaction.status'] !== 'pending') {
				const notification = await Notification.create({
					loyalty_id: detail['member_card.loyalty_card.loyalties.id'],
					type: 'conversion',
					transaction_id: detail['transaction.id'],
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
						members_id: detail['member_card.member.id'],
						notification_id: notification.id,
						read: 0,
					});

					await FcmSender.sendToUser(detail['member_card.member.id'], {
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
		});
	} else {
		logger.error('Not found KrisFlyer');
	}

	logger.info('============================== END KRISFLYER NOTIFICATION ==================================');
};

run().catch((err) => {
	logger.error(err);
});
