const Otp = require('../models').Otp.Get;
const ForgotPassword = require('../models').ForgotPassword.Get;
const WaveCellSender = require('../helper/WaveCellSender');

// check otp for forgot pin
exports.forgotCheckOtp = (condition, otpNumber = null) => ForgotPassword.findOne({
	where: condition,
}).then(async (otp) => {
	if (otpNumber != null) {
		const waveSender = new WaveCellSender();

		const responseOtp = await waveSender.checkOtp(otpNumber, otp.uid);

		const values = {
			...responseOtp,
			...condition,
		};

		let otpMember = null;

		if (otp != null) {
			otp.update(values);

			otpMember = otp;
		} else {
			otpMember = await ForgotPassword.create(values);
		}

		return otpMember;
	}

	return otp;
});

// send otp for forgot pin otp
exports.forgotPinOtp = (condition, phoneNumber = null) => ForgotPassword.findOne({
	where: condition,
}).then(async (otp) => {
	if (phoneNumber != null) {
		const waveSender = new WaveCellSender();

		const responseOtp = await waveSender.sendOtp(phoneNumber);

		const values = {
			...responseOtp,
			...condition,
		};

		let otpMember = null;

		if (otp != null) {
			otp.update(values);

			otpMember = otp;
		} else {
			otpMember = await ForgotPassword.create(values);
		}

		return otpMember;
	}


	return otp;
});

exports.sendOtp = (condition, phoneNumber = null) => Otp.findOne({
	where: condition,
}).then(async (otp) => {
	if (phoneNumber != null) {
		const waveSender = new WaveCellSender();

		const responseOtp = await waveSender.sendOtp(phoneNumber);

		const values = {
			...responseOtp,
			...condition,
		};

		let otpMember = null;

		if (otp != null) {
			otp.update(values);

			otpMember = otp;
		} else {
			otpMember = await Otp.create(values);
		}

		return otpMember;
	}


	return otp;
});

exports.checkOtp = (condition, otpNumber = null) => Otp.findOne({
	where: condition,
}).then(async (otp) => {
	if (otpNumber != null) {
		const waveSender = new WaveCellSender();

		const responseOtp = await waveSender.checkOtp(otpNumber, otp.uid);

		const values = {
			...responseOtp,
			...condition,
		};

		let otpMember = null;

		if (otp != null) {
			otp.update(values);

			otpMember = otp;
		} else {
			otpMember = await Otp.create(values);
		}

		return otpMember;
	}

	return otp;
});

const createOtp = () => Math.floor(100000 + Math.random() * 900000);

const createExpireDate = (minutes) => {
	const d = new Date();
	return new Date(d.getTime() + minutes * 60000);
};

exports.createExpireDate = createExpireDate;
exports.createOtpNumber = createOtp;
