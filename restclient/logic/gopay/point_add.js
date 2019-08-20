const Request = require('../../request');
const model = require('../../../models/index');

const Members = model.Members.Get;
const MemberCards = model.MembersCards.Get;

module.exports = async (params, transaction) => {
	const res = {
		status: false,
		pendingOnly: true,
		data: [],
	};

	const url = 'https://app.sandbox.midtrans.com/iris/';
	const payoutUrl = `${url}api/v1/payouts`;
	const approveUrl = `${url}api/v1/payouts/approve`;

	Members.hasOne(MemberCards, {
		foreignKey: 'members_id',
	});

	const member = await Members.findOne({
		include: [
			{
				model: MemberCards,
				required: true,
				where: {
					id: transaction.conversion_member_cards_id,
				},
			},
		],
	});

	if (member != null) {
		const req = new Request();
		req.createHeaders({
			Authorization: 'Basic SVJJUy03MDg2YmIyOC1mMzgxLTQ1NjQtYTEzOS0wNzMyMzNhMzJjOWI6',
			'Content-Type': 'application/json',
			'X-Idempotency-Key': transaction.unix_id,
			Accept: 'application/json',
		});

		const payoutModels = {
			payouts: [
				{
					beneficiary_name: member.full_name,
					beneficiary_account: member.member_card.mobile_number,
					beneficiary_bank: 'gopay',
					amount: `${params.point}.00`,
					notes: transaction.unix_id,
				},
			],
		};

		const resPayout = await req.request(payoutUrl, 'POST', JSON.stringify(payoutModels));

		if (resPayout.payouts.length > 0) {
			const { status } = resPayout.payouts[0];
			const referencePayout = resPayout.payouts[0].reference_no;

			if (status === 'queued') {
				req.createHeaders({
					Authorization: 'Basic SVJJUy00NzU5ZjI1ZS1iMzY5LTQ5ZDEtODRkOS1jZDk0MWFiNTE0MTY6',
					'Content-Type': 'application/json',
					'X-Idempotency-Key': `${transaction.unix_id}_APPROVAL`,
					Accept: 'application/json',
				});

				const resApprove = await req.request(approveUrl, 'POST', JSON.stringify({
					reference_nos: [
						referencePayout,
					],
				}));

				if (resApprove.status === 'ok') {
					res.status = true;
					res.data.push({
						value: params.point,
						displayName: 'point_balance',
						keyName: 'point_balance',
					});

					res.data.push({
						value: resApprove.status,
						displayName: 'message',
						keyName: 'message',
					});

					res.data.push({
						value: referencePayout,
						displayName: 'Transaction ID',
						keyName: 'trx_id',
					});
				}
			}
		}
	}


	return res;
};
