const error400 = require('./4xx/400');
const error401 = require('./4xx/401');
const error417 = require('./4xx/417');
const error422 = require('./4xx/422');
const message200 = require('./2xx/200');
const message202 = require('./2xx/202');

const instance = {
	validations: {
		...message200,
		...message202,
		...error400,
		...error401,
		...error417,
		...error422,
	},
	getMessage: (code, parameters = {}) => {
		let message = '';
		let params = [];
		if (Object.prototype.hasOwnProperty.call(instance.validations, code)) {
			switch (typeof (instance.validations[code])) {
			case 'string':
				message = instance.validations[code];
				break;

			case 'object':
				({ message, params } = instance.validations[code]);

				Object.keys(parameters).forEach((key) => {
					if (params.find(value => value === key)) {
						message = message.replace(`:${key}`, parameters[key]);
					}
				});
				break;

			default:
				message = 'General Error';
				break;
			}
		}
		return message;
	},
};

module.exports = instance;
