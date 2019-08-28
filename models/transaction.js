const sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
const moment = require('moment');

moment.locale('id');

const model = require('./conn/sequelize').sequelize;

const MemberCards = require('./member_cards');

const Transaction = model.define('transaction', {
	unix_id: {
		type: sequelize.INTEGER,
		allowNull: false,
		maxLength: 11,
	},
	member_cards_id: {
		type: sequelize.INTEGER,
		allowNull: false,
		maxLength: 10,
	},
	conversion_member_cards_id: {
		type: sequelize.INTEGER,
		allowNull: false,
		maxLength: 10,
	},
	point: {
		type: sequelize.INTEGER,
		allowNull: false,
		maxLength: 11,
	},
	conversion_point: {
		type: sequelize.INTEGER,
		allowNull: false,
		maxLength: 11,
	},
	point_balance: {
		type: sequelize.INTEGER,
		allowNull: false,
		maxLength: 11,
	},
	point_balance_after: {
		type: sequelize.INTEGER,
		allowNull: false,
		maxLength: 11,
	},
	conversion_point_balance: {
		type: sequelize.INTEGER,
		allowNull: false,
		maxLength: 11,
	},
	conversion_point_balance_after: {
		type: sequelize.INTEGER,
		allowNull: false,
		maxLength: 11,
	},
	trxid: {
		type: sequelize.STRING,
		allowNull: true,
		maxLength: 255,
	},
	trxstatus: {
		type: sequelize.STRING,
		allowNull: true,
	},
	status: {
		type: sequelize.STRING,
		allowNull: true,
		maxLength: 45,
	},
	fee: {
		type: sequelize.INTEGER,
		allowNull: false,
		maxLength: 11,
	},
	feeidr: {
		type: sequelize.INTEGER,
		allowNull: false,
		maxLength: 11,
	},
	mid_rate_from: {
		type: sequelize.INTEGER,
		allowNull: false,
		maxLength: 11,
	},
	mid_rate_to: {
		type: sequelize.INTEGER,
		allowNull: false,
		maxLength: 11,
	},
	conversion_date: {
		type: sequelize.VIRTUAL(sequelize.DATE),
		allowNull: false,
		get() {
			return moment(this.created_at).format('DD MMMM YY hh:mm');
		},
	},
}, {
	timestamps: true,
	underscored: true,
	deletedAt: 'deleted_at',
	paranoid: true,
	freezeTableName: true,
	tableName: 'transaction',
});

Transaction.hasMany(MemberCards.Get, {
	foreignKey: 'id',
	sourceKey: 'member_cards_id',
	as: 'source_member_cards',
});

Transaction.hasMany(MemberCards.Get, {
	foreignKey: 'id',
	sourceKey: 'conversion_member_cards_id',
	as: 'target_member_cards',
});

sequelizePaginate.paginate(Transaction);

exports.Get = Transaction;
