const BaseIndex = require('../baseIndex');
const LogicType = require('../LogicType');

const getPoint = require('./get_point');
const getUser = require('./get_user');
const pointAdd = require('./point_add');

module.exports = class Gopay extends BaseIndex {
	constructor() {
		super();
		this.setupLogic(LogicType.GET_POINT, getPoint);
		this.setupLogic(LogicType.GET_USER, getUser);
		this.setupLogic(LogicType.POINT_ADD, pointAdd);

		const rules = [
			{
				label: 'Phone Number',
				key: 'mobile_number',
				required: true,
			},
		];

		this.setupValidation(LogicType.GET_POINT, rules);
		this.setupValidation(LogicType.GET_USER, rules);
	}
};
