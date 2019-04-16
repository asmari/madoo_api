const model = require('../../models/index');

const OtpMembers = model.Otp.Get;
const ForgotPassword = model.ForgotPassword.Get;
const MemberRegisters = model.MembersRegister.Get;
const Members = model.Members.Get;

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
