
const Sequelize = require('sequelize');
const model = require('./conn/sequelize').sequelize;

const PinMembers = model.define('pin_members', {
	members_id: {
		type: Sequelize.INTEGER,
	},
	pin: {
		type: Sequelize.INTEGER,
		validate: {
			notEmpty: {
				msg: 'Pin is required',
			},
		},
	},
	token: {
		type: Sequelize.STRING,
	},
	expired: {
		type: Sequelize.INTEGER,
	},
}, {
	timestamps: true,
	underscored: true,
	deletedAt: 'deleted_at',
	paranoid: true,
});

exports.Get = PinMembers;
