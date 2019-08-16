const sequelize = require('sequelize');

const model = require('./conn/sequelize').sequelize;

const KrisflyerBatch = require('./krisflyer_batch');
const Transaction = require('./transaction');
const MemberCards = require('./member_cards');

const KrisflyerBatchDetail = model.define('krisflayer_batch_upload_detail', {
	krisflayer_batch_upload_id: {
		type: sequelize.INTEGER,
		references: {
			model: KrisflyerBatch,
			key: 'id',
		},
	},
	unix_id: {
		type: sequelize.INTEGER,
		allowNull: false,
	},
	id_transaction: {
		type: sequelize.INTEGER,
		allowNull: false,
		references: {
			model: Transaction.Get,
			key: 'id',
		},
	},
	member_cards_id: {
		type: sequelize.INTEGER,
		allowNull: false,
		references: {
			model: MemberCards.Get,
			key: 'id',
			as: 'member_card',
		},
	},
	conversion_member_cards_id: {
		type: sequelize.INTEGER,
		allowNull: false,
		references: {
			model: MemberCards.Get,
			key: 'id',
			as: 'conversion_member_card',
		},
	},
	card_number: {
		type: sequelize.STRING,
		allowNull: true,
	},
	first_name: {
		type: sequelize.STRING,
		allowNull: true,
	},
	last_name: {
		type: sequelize.STRING,
		allowNull: true,
	},
	reference_code: {
		type: sequelize.STRING,
		allowNull: true,
	},
	mid_rate_from: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
	mid_rate_to: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
	fee: {
		type: sequelize.DOUBLE,
		allowNull: true,
	},
	feeidr: {
		type: sequelize.DOUBLE,
		allowNull: true,
	},
	point: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
	conversion_point: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
	point_balance: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
}, {
	timestamps: true,
	deletedAt: 'deleted_at',
	paranoid: true,
	underscored: true,
	freezeTableName: true,
	tableName: 'krisflayer_batch_upload_detail',
});

KrisflyerBatchDetail.hasMany(Transaction.Get, {
	foreignKey: 'id',
	sourceKey: 'id_transaction',
	as: 'transaction',
});

KrisflyerBatchDetail.hasMany(MemberCards.Get, {
	foreignKey: 'id',
	sourceKey: 'member_cards_id',
	as: 'member_card',
});

KrisflyerBatchDetail.hasMany(MemberCards.Get, {
	foreignKey: 'id',
	sourceKey: 'member_cards_id',
	as: 'conversion_member_card',
});


module.exports = KrisflyerBatchDetail;
