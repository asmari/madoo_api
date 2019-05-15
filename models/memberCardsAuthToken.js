const sequelize = require('sequelize');
const model = require('./conn/sequelize').sequelize;

const MemberCardsAuthToken = model.define('member_card_auth_tokens', {
	members_id: {
		type: sequelize.INTEGER,
	},
	members_cards_id: {
		type: sequelize.INTEGER,
	},
	type_auth: {
		type: sequelize.STRING,
	},
	auth_value: {
		type: sequelize.TEXT,
	},
}, {
	timestamps: true,
	underscored: true,
	paranoid: true,
	deletedAt: 'deleted_at',
	freezeTableName: true,
	tableName: 'member_card_auth_tokens',
});

exports.Get = MemberCardsAuthToken;
