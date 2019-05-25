const sequelize = require('sequelize');

const model = require('./conn/sequelize').sequelize;

const TransactionLog = model.define('transaction_log', {
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
	type_trx: {
		type: sequelize.STRING,
		maxLength: 45,
		allowNull: false,
	},
	status: {
		type: sequelize.TINYINT,
		maxLength: 1,
		allowNull: false,
	},
	point_balance: {
		type: sequelize.INTEGER,
		allowNull: false,
	},
}, {
	timestamps: true,
	underscored: true,
	deletedAt: 'deleted_at',
	paranoid: true,
	freezeTableName: true,
	tableName: 'transaction_log',
});

exports.Get = TransactionLog;
