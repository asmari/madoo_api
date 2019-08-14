module.exports = class BaseIndex {
	constructor() {
		this.logic = {};
		this.validation = {};
	}

	setupLogic(logicName, callback) {
		this.logic[logicName] = callback;
	}

	setupValidation(logicName, validations) {
		this.validation[logicName] = validations;
	}

	methods() {
		return Object.keys(this.logic);
	}

	async run(logicName, parameter, otherParamter) {
		if (Object.prototype.hasOwnProperty.call(this.logic, logicName)) {
			return this.logic[logicName](parameter, otherParamter);
		}

		return Promise.reject(new Error(`Logic ${logicName} not found`));
	}

	// eslint-disable-next-line class-methods-use-this
	__filterRequired(data) {
		const t = {
			typeValue: null,
			displayName: null,
			keyName: null,
		};

		if (typeof data === 'object') {
			if (Object.prototype.hasOwnProperty.call(data, 'type')) {
				t.typeValue = data.type;
			} else {
				t.typeValue = 'string';
			}

			if (Object.prototype.hasOwnProperty.call(data, 'label')) {
				t.displayName = data.label;
			} else {
				t.displayName = data.key;
			}

			t.keyName = data.key;
		} else {
			t.displayName = data;
			t.keyName = data;
			t.typeValue = 'string';
		}

		return t;
	}

	mapRequired(logicName) {
		if (Object.prototype.hasOwnProperty.call(this.validation, logicName)) {
			const res = [];
			const rules = this.validation[logicName];

			if (Array.isArray(rules)) {
				rules.forEach((v) => {
					// eslint-disable-next-line no-underscore-dangle
					res.push(this.__filterRequired(v));
				});
			} else {
				// eslint-disable-next-line no-underscore-dangle
				res.push(this.__filterRequired(rules));
			}

			return res;
		}

		return null;
	}
};
