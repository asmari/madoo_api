const Sequelize = require('sequelize');

const model = require('./conn/sequelize').sequelize;

const MemberCards = model.define('member_cards_log', {
	members_id: {
		type: Sequelize.INTEGER,
		allowNull: false,
		validate: {
			notEmpty: {
				msg: 'Members Id is required',
			},
		},
	},
	type_id: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			notEmpty: {
				msg: 'Member Type',
			},
		},
	},
	card_number: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	full_name: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	email: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	mobile_number: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	date_birth: {
		type: Sequelize.DATE,
		allowNull: true,
		defaultValue: null,
	},
	member_level: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	// cvv:{
	//     type:Sequelize.STRING,
	//     allowNull:true
	// },
	signup_date: {
		type: Sequelize.DATE,
		allowNull: false,
	},
	expiry_date: {
		type: Sequelize.DATE,
		allowNull: true,
	},
	point_balance: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
}, {
	timestamps: true,
	underscored: true,
	deletedAt: 'deleted_at',
	freezeTableName: true,
	tableName: 'member_cards_log',
	paranoid: true,
});


exports.Get = MemberCards;
