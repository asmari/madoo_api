const json = require('./code.json');

module.exports = {
	detectCountry(numberPhone, code) {
		let isHave = null;
		let phone = numberPhone;
		let countryCode = code;

		if (phone.indexOf('0') === 0) {
			phone = phone.substr(1, (phone.length - 1));
		}

		if (countryCode != null) {
			if (countryCode.indexOf('+') === -1) {
				countryCode = `+${countryCode}`;
			}
			phone = phone.replace(countryCode, '');

			isHave = {
				mobile_phone: phone,
				code: countryCode,
				fullphone: `${countryCode}${phone}`,
			};
		}

		json.forEach((v) => {
			if (v.dial_code !== '' && phone.indexOf(v.dial_code) !== -1) {
				const phoneTrim = phone.replace((v.dial_code || countryCode), '');
				isHave = {
					mobile_phone: phoneTrim,
					code: countryCode || v.dial_code,
					fullphone: `${countryCode || v.dial_code}${phoneTrim}`,
				};
			}
		});

		return isHave;
	},
};
