const model = require('../models/index');
const RestClient = require('./index');

const RestLogic = require('./logic');
const LogicType = require('./logic/LogicType');

const Loyalty = model.Loyalty.Get;
const MemberCards = model.MembersCards.Get;
const MemberCardsToken = model.MemberCardsAuthToken.Get;

module.exports = class LoyaltyRequest {
	constructor() {
		this.log = {};
	}

	static get STATUS() {
		return {
			NO_LOYALTY: 'Loyalty not found',
			NO_VALUE: 'Value for the type is null',
			TYPE_NO_CHOICE: 'Type cannot be zero',
			LOYALTY_ZERO: 'Loyalty id cannot be zero',
			LOYALTY_NOT_READY: 'Loyalty is not ready',
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

	getLog() {
		return this.log;
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
			if (this.loyalty.api_user_detail === null) {
				throw new Error(LoyaltyRequest.STATUS.LOYALTY_NOT_READY);
			}

			return this.loyalty.api_user_detail;

		case LoyaltyRequest.TYPE.POINT_BALANCE:
			if (this.loyalty.api_user_detail === null) {
				throw new Error(LoyaltyRequest.STATUS.LOYALTY_NOT_READY);
			}
			return this.loyalty.api_user_point;

		case LoyaltyRequest.TYPE.POINT_PLUS:
			if (this.loyalty.api_user_detail === null) {
				throw new Error(LoyaltyRequest.STATUS.LOYALTY_NOT_READY);
			}
			return this.loyalty.api_point_plus;

		case LoyaltyRequest.TYPE.POINT_MINUS:
			if (this.loyalty.api_user_detail === null) {
				throw new Error(LoyaltyRequest.STATUS.LOYALTY_NOT_READY);
			}
			return this.loyalty.api_point_minus;
		default:
			throw new Error(LoyaltyRequest.STATUS.LOYALTY_NOT_READY);
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

	// eslint-disable-next-line class-methods-use-this
	getNewLogic(type = 0, json) {
		if (json.indexOf('new-logic:') !== -1) {
			const logic = json.replace('new-logic:', '');
			const instanceLogic = RestLogic[logic];

			switch (type) {
			case LoyaltyRequest.TYPE.GET_PROFILE:
				return instanceLogic.mapRequired(LogicType.GET_USER);
			case LoyaltyRequest.TYPE.POINT_BALANCE:
				return instanceLogic.mapRequired(LogicType.GET_POINT);
			case LoyaltyRequest.TYPE.POINT_PLUS:
				return true;
			case LoyaltyRequest.TYPE.POINT_MINUS:
				return true;

			default:
				return null;
			}
		}

		return false;
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

		const jsonString = this.getFieldFromType(type);
		const newLogic = this.getNewLogic(type, jsonString);

		if (newLogic) {
			return newLogic;
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

	async process(type = 0, data, transaksi = {}) {
		try {
			if (type === 0) {
				throw new Error(LoyaltyRequest.STATUS.TYPE_NO_CHOICE);
			}

			const jsonString = this.getFieldFromType(type);
			const newLogic = this.getNewLogic(type, jsonString);

			if (newLogic) {
				const logic = RestLogic[jsonString.replace('new-logic:', '')];

				switch (type) {
				case LoyaltyRequest.TYPE.GET_PROFILE:
					// eslint-disable-next-line no-case-declarations
					const res1 = logic.run(LogicType.GET_USER, data, transaksi);
					this.log = logic.getLog();
					return res1;
				case LoyaltyRequest.TYPE.POINT_BALANCE:
					// eslint-disable-next-line no-case-declarations
					const res2 = logic.run(LogicType.GET_POINT, data, transaksi);
					this.log = logic.getLog();
					return res2;
				case LoyaltyRequest.TYPE.POINT_PLUS:
					// eslint-disable-next-line no-case-declarations
					const res3 = logic.run(LogicType.POINT_ADD, data, transaksi);
					this.log = logic.getLog();
					return res3;
				case LoyaltyRequest.TYPE.POINT_MINUS:
					// eslint-disable-next-line no-case-declarations
					const res4 = logic.run(LogicType.POINT_MINUS, data, transaksi);
					this.log = logic.getLog();
					return res4;
				default:
					return Promise.reject(new Error('Type Not Found'));
				}
			} else {
				const dataJson = JSON.parse(this.getFieldFromType(type));

				const restClient = new RestClient(dataJson);

				if (Object.prototype.hasOwnProperty.call(this, 'memberCardId')) {
					restClient.setAuthToken();
					const memberCard = await MemberCards.findOne({
						where: {
							id: this.memberCardId,
						},
					});

					if (restClient.hasAuth() && restClient.getAuthType() !== 'aws-v4') {
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

				const res = await restClient.request();
				this.log = restClient.getLog();
				return res;
			}
		} catch (err) {
			console.trace(err);
			return err;
		}
	}


	getMemberProfile(data = {}, transaksi = {}) {
		return this.process(LoyaltyRequest.TYPE.GET_PROFILE, data, transaksi);
	}

	getMemberPoint(data = {}, transaksi = {}) {
		return this.process(LoyaltyRequest.TYPE.POINT_BALANCE, data, transaksi);
	}

	pointAdd(data = {}, transaksi = {}) {
		return this.process(LoyaltyRequest.TYPE.POINT_PLUS, data, transaksi);
	}

	pointMinus(data = {}, transaksi = {}) {
		return this.process(LoyaltyRequest.TYPE.POINT_MINUS, data, transaksi);
	}
};
