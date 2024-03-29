const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');

const model = require('./conn/sequelize').sequelize;

const Members = require('./members');

const MemberCards = model.define('member_cards', {
	// id: {
	// 	type: Sequelize.INTEGER,
	// 	allowNull: false,
	// 	primaryKey: true,
	// 	// references:{
	// 	//     model:LoyaltyMemberCards.Get,
	// 	//     key:"member_cards_id"
	// 	// }
	// },
	members_id: {
		type: Sequelize.INTEGER,
		allowNull: false,
		references: {
			model: Members.Get,
			key: 'id',
		},
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
	paranoid: true,
});

MemberCards.hasMany(Members.Get, {
	foreignKey: 'id',
	sourceKey: 'members_id',
	as: 'member',
});

sequelizePaginate.paginate(MemberCards);

exports.Get = MemberCards;
