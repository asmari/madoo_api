const model = require('../models/index');
const RestClient = require('./index');

const Loyalty = model.Loyalty.Get;
const MemberCards = model.MembersCards.Get;
const MemberCardsToken = model.MemberCardsAuthToken.Get;

module.exports = class LoyaltyRequest {
	static get STATUS() {
		return {
			NO_LOYALTY: 'Loyalty not found',
			NO_VALUE: 'Value for the type is null',
			TYPE_NO_CHOICE: 'Type cannot be zero',
			LOYALTY_ZERO: 'Loyalty id cannot be zero',
		};
	}

	static get TYPE() {
		return {
			NO_CHOICE: 0,
			GET_PROFILE: 1,
			POINT_PLUS: 2,
			POINT_MINUS: 3,
			POINT_BALANCE: 4,
		};
	}

	async setLoyaltyId(loyaltyId = 0) {
		if (loyaltyId === 0) {
			return Promise.reject(new Error(LoyaltyRequest.STATUS.LOYALTY_ZERO));
		}

		const loyalty = await Loyalty.findOne({
			where: {
				id: loyaltyId,
			},
		});

		if (loyalty) {
			this.loyalty = loyalty;
		}

		return loyalty;
	}

	setLang(lang) {
		this.lang = lang;
	}

	isLoyaltyExist() {
		return this.loyalty != null;
	}

	getFieldFromType(type = 0) {
		switch (type) {
		case LoyaltyRequest.TYPE.GET_PROFILE:
			return this.loyalty.api_user_detail;

		case LoyaltyRequest.TYPE.POINT_BALANCE:
			return this.loyalty.api_user_point;

		case LoyaltyRequest.TYPE.POINT_PLUS:
			return this.loyalty.api_point_plus;

		case LoyaltyRequest.TYPE.POINT_MINUS:
			return this.loyalty.api_point_minus;
		default:
			return null;
		}
	}

	static getFieldFromAuth(auth = {}) {
		const dataField = {};

		Object.keys(auth).forEach((key) => {
			if (Object.prototype.hasOwnProperty.call(auth[key], 'body')) {
				if (Object.prototype.hasOwnProperty.call(auth[key].body, 'required')) {
					auth[key].body.required.forEach((value) => {
						let keyValue = value;
						const valValue = {
							displayName: value,
							typeValue: 'string',
						};
						if (typeof value === 'object') {
							if (Object.prototype.hasOwnProperty.call(value, 'keyName')) {
								keyValue = value.keyName;
							}

							if (Object.prototype.hasOwnProperty.call(value, 'displayName')) {
								valValue.displayName = value.displayName;
							} else {
								valValue.displayName = keyValue;
							}

							if (Object.prototype.hasOwnProperty.call(value, 'type')) {
								valValue.typeValue = value.type;
							}
						}

						dataField[keyValue] = valValue;
					});
				}
			}
		});

		return dataField;
	}

	static getFieldFromBody(body = {}) {
		const dataField = {};

		const checkAgainst = ['required', 'checkResponse'];

		checkAgainst.forEach((key) => {
			if (Object.prototype.hasOwnProperty.call(body, key)) {
				body[key].forEach((value) => {
					let keyValue = value;
					const valValue = {
						displayName: value,
						typeValue: 'string',
					};

					if (typeof value === 'object') {
						if (Object.prototype.hasOwnProperty.call(value, 'keyName')) {
							keyValue = value.keyName;
						}

						if (Object.prototype.hasOwnProperty.call(value, 'displayName')) {
							valValue.displayName = value.displayName;
						} else {
							valValue.displayName = keyValue;
						}

						if (Object.prototype.hasOwnProperty.call(value, 'type')) {
							valValue.typeValue = value.type;
						}
					}

					dataField[keyValue] = valValue;
				});
			}
		});

		return dataField;
	}

	matchRequiredField(type = 0, data) {
		const requiredField = this.checkRequiredField(type);
		const notExists = [];

		requiredField.forEach((value) => {
			let keyValue = value;

			if (typeof value === 'object') {
				if (Object.prototype.hasOwnProperty.call(value, 'keyName')) {
					keyValue = value.keyName;
				}
			}

			if (!Object.prototype.hasOwnProperty.call(data, keyValue)) {
				notExists.push(keyValue);
			}
		});

		return notExists;
	}

	getLoyaltyName() {
		return this.loyalty.name;
	}

	checkRequiredField(type = 0) {
		if (!this.isLoyaltyExist()) {
			throw new Error(LoyaltyRequest.STATUS.NO_LOYALTY);
		}

		if (type === 0) {
			throw new Error(LoyaltyRequest.STATUS.TYPE.NO_CHOICE);
		}

		const requiredField = {};

		if (this.getFieldFromType(type) == null) {
			throw new Error(LoyaltyRequest.STATUS.NO_VALUE);
		}

		const json = JSON.parse(this.getFieldFromType(type));

		if (Object.prototype.hasOwnProperty.call(json, 'auth')) {
			const authField = LoyaltyRequest.getFieldFromAuth(json.auth);
			Object.assign(requiredField, authField);
		}

		if (Object.prototype.hasOwnProperty.call(json, 'body')) {
			const bodyField = LoyaltyRequest.getFieldFromBody(json.body);
			Object.assign(requiredField, bodyField);
		}

		return Object.keys(requiredField).map(value => ({
			keyName: value,
			displayName: requiredField[value].displayName,
			typeValue: requiredField[value].typeValue,
		}));
	}

	setMemberCardId(id) {
		this.memberCardId = id;
	}

	async process(type = 0, data) {
		try {
			if (type === 0) {
				throw new Error(LoyaltyRequest.STATUS.TYPE_NO_CHOICE);
			}

			const dataJson = JSON.parse(this.getFieldFromType(type));

			const restClient = new RestClient(dataJson);

			if (Object.prototype.hasOwnProperty.call(this, 'memberCardId')) {
				restClient.setAuthToken();
				const memberCard = await MemberCards.findOne({
					where: {
						id: this.memberCardId,
					},
				});

				if (restClient.hasAuth()) {
					const memberToken = await MemberCardsToken.findOne({
						where: {
							members_cards_id: memberCard.id,
						},
					});

					const tokenValue = JSON.parse(memberToken.auth_value);

					switch (memberToken.type_auth) {
					case 'oauth2':
						if (tokenValue && tokenValue.length > 0) {
							tokenValue.forEach((value) => {
								if (value.keyName === 'token') {
									restClient.changeHeader('Authorization', `Bearer ${value.value}`);
								}
							});

							restClient.removeAuth();
						}
						break;
					default:
						break;
					}
				}

				restClient.insertBody({
					...memberCard.toJSON(),
					...data,
				});
			} else {
				restClient.insertBody(data);
			}

			if (this.lang != null) {
				restClient.setLanguage(this.lang);
			}

			return restClient.request();
		} catch (err) {
			return err;
		}
	}


	getMemberProfile(data = {}) {
		return this.process(LoyaltyRequest.TYPE.GET_PROFILE, data);
	}

	getMemberPoint(data = {}) {
		return this.process(LoyaltyRequest.TYPE.POINT_BALANCE, data);
	}

	pointAdd(data = {}) {
		return this.process(LoyaltyRequest.TYPE.POINT_PLUS, data);
	}

	pointMinus(data = {}) {
		return this.process(LoyaltyRequest.TYPE.POINT_MINUS, data);
	}
};
