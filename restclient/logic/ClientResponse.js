/* eslint-disable camelcase */
module.exports = class ClientResponse {
	constructor() {
		this.full_name = null;
		this.card_number = null;
		this.email = null;
		this.mobile_number = null;
		this.date_birth = null;
		this.member_level = null;
		this.point_balance = null;
	}

	toJson() {
		return {
			full_name: this.full_name,
			card_number: this.card_number,
			email: this.email,
			mobile_number: this.mobile_number,
			date_birth: this.date_birth,
			member_level: this.member_level,
			point_balance: this.point_balance,
		};
	}
};
