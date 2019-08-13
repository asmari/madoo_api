const BaseIndex = require('../baseIndex');
const LogicType = require('../LogicType');

const getPoint = require('./get_point');
const getUser = require('./get_user');
const pointAdd = require('./point_add');

module.exports = class Krisflyer extends BaseIndex {
	constructor() {
		super();
		const rules = [
			{
				label: 'First Name',
				key: 'first_name',
				required: true,
			}, {
				label: 'Last Name',
				key: 'last_name',
				required: true,
			}, {
				label: 'Card Number',
				key: 'card_number',
				required: true,
			},
		];

		this.setupLogic(LogicType.GET_POINT, getPoint);
		this.setupLogic(LogicType.GET_USER, getUser);
		this.setupLogic(LogicType.POINT_ADD, pointAdd);

		this.setupValidation(LogicType.GET_POINT, rules);
		this.setupValidation(LogicType.GET_USER, rules);
	}
};
